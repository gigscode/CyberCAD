import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    // Fetch course to get price
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, name, price_kobo')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrolments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 });
    }

    // Fetch user email for Paystack
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    // Generate a unique reference
    const reference = `secacad_${courseId.slice(0, 8)}_${user.id.slice(0, 8)}_${Date.now()}`;

    // Initialize Paystack transaction
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: course.price_kobo,
        reference,
        currency: 'NGN',
        metadata: {
          course_id: courseId,
          course_name: course.name,
          user_id: user.id,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim(),
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard/courses`,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      console.error('Paystack init error:', paystackData);
      return NextResponse.json({ error: paystackData.message ?? 'Payment initialization failed' }, { status: 500 });
    }

    // Pre-create a pending payment record
    await supabase.from('payments').insert({
      user_id: user.id,
      course_id: courseId,
      paystack_reference: reference,
      paystack_status: 'pending',
      amount_kobo: course.price_kobo,
      currency: 'NGN',
      metadata: { course_name: course.name },
    });

    return NextResponse.json({
      reference,
      access_code: paystackData.data.access_code,
      authorization_url: paystackData.data.authorization_url,
      amount_kobo: course.price_kobo,
      email: user.email,
      course_name: course.name,
    });
  } catch (err: any) {
    console.error('Payment initialize error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
