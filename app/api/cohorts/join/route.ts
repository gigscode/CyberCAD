import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cohortId } = await request.json();
    if (!cohortId) {
      return NextResponse.json({ error: 'cohortId is required' }, { status: 400 });
    }

    // Check cohort exists and is active/upcoming
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('*')
      .eq('id', cohortId)
      .single();

    if (cohortError || !cohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('cohort_learners')
      .select('id')
      .eq('cohort_id', cohortId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already a member of this cohort' }, { status: 409 });
    }

    // Add learner to cohort
    const { error: insertError } = await supabase
      .from('cohort_learners')
      .insert({ cohort_id: cohortId, user_id: user.id });

    if (insertError) throw insertError;

    // Create initial learner_progress record
    await supabase.from('learner_progress').upsert({
      learner_id: user.id,
      cohort_id: cohortId,
      status: 'on-track',
      current_score: 0,
      learning_hours_this_week: 0,
      inactivity_days: 0,
    });

    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'joined_cohort',
      target_cohort_id: cohortId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
