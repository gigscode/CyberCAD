import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
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

    if (!profile || !['admin', 'super-admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, reviewNotes } = body;

    const { data: recommendation, error } = await supabase
      .from('drop_recommendations')
      .update({
        status,
        review_notes: reviewNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, update learner status
    if (status === 'approved' && recommendation.learner_id) {
      await supabase
        .from('profiles')
        .update({ status: 'dropped' })
        .eq('id', recommendation.learner_id);

      await supabase
        .from('learner_progress')
        .update({ status: 'dropped' })
        .eq('learner_id', recommendation.learner_id)
        .eq('cohort_id', recommendation.cohort_id);

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'drop_recommendation_approved',
        target_user_id: recommendation.learner_id,
        target_cohort_id: recommendation.cohort_id,
        details: { recommendationId: id, reviewNotes },
      });
    }

    return NextResponse.json({ ...recommendation, _id: recommendation.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
