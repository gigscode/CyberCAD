import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    const { ids, action, reason } = await request.json();

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: applications, error } = await supabase
      .from('applications')
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_reason: reason,
      })
      .in('id', ids)
      .select();

    if (error) throw error;

    // If approving, bulk-add learners to cohorts
    if (action === 'approve' && applications) {
      for (const app of applications) {
        if (app.user_id && app.cohort_id) {
          await supabase.from('cohort_learners').upsert({
            cohort_id: app.cohort_id,
            user_id: app.user_id,
          });
          await supabase.from('learner_progress').upsert({
            learner_id: app.user_id,
            cohort_id: app.cohort_id,
            course_id: app.course_id,
            status: 'on-track',
            current_score: 0,
            learning_hours_this_week: 0,
            inactivity_days: 0,
          });
        }
      }
    }

    return NextResponse.json({ updated: (applications ?? []).length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
