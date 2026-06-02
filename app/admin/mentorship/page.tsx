'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/stat-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Search, TrendingUp, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorshipPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select('*, profiles(first_name, last_name, email, avatar), courses(name)')
        .order('clicked_at', { ascending: false });
      if (error) throw error;
      setRequests(data ?? []);
    } catch {
      toast.error('Failed to load mentorship requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Group by learner to find top requesters
  const byLearner = requests.reduce((acc: Record<string, number>, r) => {
    const key = r.user_id;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const uniqueLearners = Object.keys(byLearner).length;

  // Top course by mentorship demand
  const byCourse = requests.reduce((acc: Record<string, number>, r) => {
    const name = r.courses?.name ?? 'Unknown';
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});
  const topCourse = Object.entries(byCourse).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const filtered = requests.filter(r =>
    `${r.profiles?.first_name} ${r.profiles?.last_name} ${r.courses?.name ?? ''}`
      .toLowerCase().includes(search.toLowerCase())
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
        <Badge className="bg-violet-50 text-violet-700 border-violet-100 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider mb-2">
          Mentorship
        </Badge>
        <h1 className="text-3xl font-medium tracking-tight text-slate-900">Mentorship Requests</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Every time a learner clicks "Get Mentorship" — logged here for demand tracking.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={MessageSquare} label="Total Clicks" value={requests.length}
          iconColor="text-violet-600" iconBgColor="bg-violet-50" />
        <StatCard icon={TrendingUp} label="Unique Learners" value={uniqueLearners}
          iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
        <StatCard icon={BookOpen} label="Top Course" value={topCourse}
          iconColor="text-blue-600" iconBgColor="bg-blue-50" />
      </div>

      {/* Insight banner */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
        <MessageSquare className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
        <p className="text-sm text-violet-800 font-medium">
          High mentorship demand on a specific course is a signal to add more content, a FAQ section,
          or a dedicated Q&amp;A lesson. Use this data to prioritise content updates.
        </p>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search by learner or course..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-slate-50 border-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                {['Learner', 'Course', 'Message Preview', 'Date & Time'].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 rounded-xl">
                        <AvatarImage src={r.profiles?.avatar} />
                        <AvatarFallback className="bg-violet-50 text-violet-600 font-semibold text-xs">
                          {r.profiles?.first_name?.[0]}{r.profiles?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{r.profiles?.first_name} {r.profiles?.last_name}</p>
                        <p className="text-xs text-slate-400">{r.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 font-medium">{r.courses?.name ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-500 max-w-[260px]">
                    <p className="truncate">{r.message ?? '—'}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 font-medium whitespace-nowrap">
                    {new Date(r.clicked_at).toLocaleString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No mentorship requests yet</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20 text-xs text-slate-400 font-medium">
          {filtered.length} of {requests.length} requests
        </div>
      </div>
    </div>
  );
}
