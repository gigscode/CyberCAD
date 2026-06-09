import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS for atomic enrolment creation
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  // Verify Paystack HMAC-SHA512 signature
  const signature = req.headers.get('x-paystack-signature');
  const rawBody = await req.text();

  const expectedSig = crypto
    .createHmac('sha512', paystackSecret)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSig) {
    console.warn('Paystack webhook: invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only process successful charges
  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }

  const { reference, metadata, amount } = event.data;
  const courseId = metadata?.course_id;
  const userId = metadata?.user_id;

  if (!courseId || !userId) {
    console.error('Webhook missing course_id or user_id in metadata', metadata);
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Idempotency — check if already processed
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, paystack_status')
    .eq('paystack_reference', reference)
    .maybeSingle();

  if (existingPayment?.paystack_status === 'success') {
    // Already processed, safe to return 200
    return NextResponse.json({ received: true });
  }

  // Check not already enrolled (idempotency for enrolments)
  const { data: existingEnrolment } = await supabase
    .from('enrolments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  // Update payment record to success
  if (existingPayment) {
    await supabase
      .from('payments')
      .update({ paystack_status: 'success', paid_at: new Date().toISOString() })
      .eq('paystack_reference', reference);
  } else {
    // Payment record doesn't exist yet (webhook came before our pre-create in some edge case)
    await supabase.from('payments').insert({
      user_id: userId,
      course_id: courseId,
      paystack_reference: reference,
      paystack_status: 'success',
      amount_kobo: amount,
      currency: 'NGN',
      paid_at: new Date().toISOString(),
      metadata,
    });
  }

  // Create enrolment if not already enrolled
  if (!existingEnrolment) {
    const { data: paymentRow } = await supabase
      .from('payments')
      .select('id')
      .eq('paystack_reference', reference)
      .single();

    await supabase.from('enrolments').insert({
      user_id: userId,
      course_id: courseId,
      payment_id: paymentRow?.id ?? null,
      status: 'active',
      enrolled_at: new Date().toISOString(),
    });

    // Create initial learner_progress row
    await supabase.from('learner_progress').upsert({
      learner_id: userId,
      course_id: courseId,
      completed_lessons: [],
      current_score: 0,
      learning_hours_total: 0,
      last_activity_date: new Date().toISOString(),
      module_progress: [],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'learner_id,course_id' });

    // Send in-app notification
    const courseName = metadata?.course_name ?? 'your course';
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Enrolment confirmed 🎉',
      message: `You are now enrolled in ${courseName}. Start learning at your own pace.`,
      type: 'success',
      is_read: false,
      action_url: `/dashboard/courses`,
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_id: userId,
      action: 'enrol',
      target_id: courseId,
      target_type: 'course',
      details: { reference, amount_kobo: amount, course_name: courseName },
    });
  }

  return NextResponse.json({ received: true });
}
