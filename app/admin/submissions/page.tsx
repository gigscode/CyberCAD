'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatCard } from '@/components/stat-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, CheckCircle2, Clock, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function SubmissionsPage() {
  const supabase = createClient();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, profiles(first_name, last_name, email, avatar), lessons(name), courses(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSubmissions(data ?? []);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const openGrade = (s: any) => {
    setSelected(s);
    setGrade(s.grade?.toString() ?? '');
    setFeedback(s.feedback ?? '');
  };

  const handleGrade = async () => {
    if (!selected) return;
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
      toast.error('Grade must be between 0 and 100');
      return;
    }
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('submissions')
        .update({ grade: numGrade, feedback, graded_by: user?.id, graded_at: new Date().toISOString() })
        .eq('id', selected.id);
      if (error) throw error;
      toast.success('Graded successfully');
      setSelected(null);
      load();
    } catch {
      toast.error('Failed to save grade');
    } finally {
      setIsSaving(false);
    }
  };

  const ungraded = submissions.filter(s => s.grade === null || s.grade === undefined);
  const graded = submissions.filter(s => s.grade !== null && s.grade !== undefined);

  const filtered = submissions.filter(s =>
    `${s.profiles?.first_name} ${s.profiles?.last_name} ${s.lessons?.name}`.toLowerCase()
      .includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-96 bg-slate-100 animate-pulse rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/60">
        <Badge className="bg-amber-50 text-amber-700 border-amber-100 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider mb-2">
          Grading
        </Badge>
        <h1 className="text-3xl font-medium tracking-tight text-slate-900">Submissions</h1>
        <p className="text-slate-500 mt-1 text-sm">Review and grade learner assignment submissions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Total Submissions" value={submissions.length}
          iconColor="text-slate-600" iconBgColor="bg-slate-50" />
        <StatCard icon={Clock} label="Awaiting Grade" value={ungraded.length}
          iconColor="text-amber-600" iconBgColor="bg-amber-50" />
        <StatCard icon={CheckCircle2} label="Graded" value={graded.length}
          iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search submissions..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-slate-50 border-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                {['Learner', 'Lesson', 'Course', 'Grade', 'Submitted', 'Action'].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 rounded-xl">
                        <AvatarImage src={s.profiles?.avatar} />
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 font-semibold text-xs">
                          {s.profiles?.first_name?.[0]}{s.profiles?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{s.profiles?.first_name} {s.profiles?.last_name}</p>
                        <p className="text-xs text-slate-400">{s.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700 font-medium">{s.lessons?.name ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{s.courses?.name ?? '—'}</td>
                  <td className="px-5 py-4">
                    {s.grade != null ? (
                      <span className={cn('text-sm font-bold',
                        s.grade >= 70 ? 'text-emerald-600' : s.grade >= 50 ? 'text-amber-600' : 'text-rose-600'
                      )}>
                        {s.grade}%
                      </span>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-none text-[9px] font-semibold uppercase">
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 font-medium">
                    {new Date(s.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-5 py-4">
                    <Button size="sm" variant="outline"
                      onClick={() => openGrade(s)}
                      className="h-8 rounded-lg text-xs font-semibold border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600">
                      {s.grade != null ? 'Edit Grade' : 'Grade'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No submissions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Grading dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-lg rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-indigo-600 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">Grade Submission</DialogTitle>
              <p className="text-indigo-100 text-sm mt-1">
                {selected?.profiles?.first_name} {selected?.profiles?.last_name} · {selected?.lessons?.name}
              </p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            {/* Submission content preview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-40 overflow-y-auto">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Submission</p>
              <p className="text-sm text-slate-700 leading-relaxed">{selected?.content}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Score (0–100)
              </label>
              <Input
                type="number" min="0" max="100" placeholder="e.g. 85"
                value={grade} onChange={e => setGrade(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-slate-100 text-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Feedback for learner
              </label>
              <Textarea
                placeholder="Write your feedback here..."
                value={feedback} onChange={e => setFeedback(e.target.value)}
                className="rounded-xl bg-slate-50 border-slate-100 min-h-[100px] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="bg-slate-50 p-8 pt-4 flex gap-3">
            <Button variant="ghost" onClick={() => setSelected(null)} className="flex-1 h-12 rounded-xl font-semibold">
              Cancel
            </Button>
            <Button onClick={handleGrade} disabled={isSaving || !grade}
              className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-100">
              {isSaving ? 'Saving…' : 'Save Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
