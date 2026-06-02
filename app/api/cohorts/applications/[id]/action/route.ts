import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super-admin', 'instructor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, reason } = await request.json();

    const { data: application, error } = await supabase
      .from('applications')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, add learner to the cohort
    if (action === 'approve' && application.user_id && application.cohort_id) {
      await supabase.from('cohort_learners').upsert({
        cohort_id: application.cohort_id,
        user_id: application.user_id,
      });

      await supabase.from('learner_progress').upsert({
        learner_id: application.user_id,
        cohort_id: application.cohort_id,
        course_id: application.course_id,
        status: 'on-track',
        current_score: 0,
        learning_hours_this_week: 0,
        inactivity_days: 0,
      });
    }

    return NextResponse.json({ ...application, _id: application.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
