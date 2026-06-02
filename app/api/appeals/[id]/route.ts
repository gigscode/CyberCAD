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

    const { data: appeal, error } = await supabase
      .from('appeals')
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

    // If appeal approved, reinstate the learner
    if (status === 'approved' && appeal.learner_id) {
      await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', appeal.learner_id);

      await supabase
        .from('learner_progress')
        .update({ status: 'on-track' })
        .eq('learner_id', appeal.learner_id);

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'appeal_approved',
        target_user_id: appeal.learner_id,
        details: { appealId: id, reviewNotes },
      });
    }

    return NextResponse.json({ ...appeal, _id: appeal.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
