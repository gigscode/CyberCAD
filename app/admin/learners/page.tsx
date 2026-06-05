'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/stat-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, BookOpen, TrendingUp, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LearnersPage() {
  const supabase = createClient();
  const router = useRouter();
  const [learners, setLearners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, enrolments(id, status, courses(name)), learner_progress(current_score)')
        .eq('role', 'learner')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLearners(data ?? []);
    } catch (e: any) {
      toast.error('Failed to load learners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id);
    if (error) { toast.error('Update failed'); return; }
    toast.success(`Learner ${newStatus}`);
    load();
  };

  const filtered = learners.filter(l =>
    `${l.first_name} ${l.last_name} ${l.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const active = learners.filter(l => l.status === 'active').length;
  const enrolled = learners.filter(l => l.enrolments?.length > 0).length;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
        <div className="h-96 bg-slate-100 animate-pulse rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/60">
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider mb-2">
          Learner Management
        </Badge>
        <h1 className="text-3xl font-medium tracking-tight text-slate-900">Learners</h1>
        <p className="text-slate-500 mt-1 text-sm">All registered learners on the platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Learners" value={learners.length}
          iconColor="text-orange-600" iconBgColor="bg-orange-50" />
        <StatCard icon={TrendingUp} label="Active Accounts" value={active}
          iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
        <StatCard icon={BookOpen} label="Enrolled in Course" value={enrolled}
          iconColor="text-blue-600" iconBgColor="bg-blue-50" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search learners..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-slate-50 border-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Learner</th>
                <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Enrolled Course</th>
                <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Score</th>
                <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Joined</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(l => {
                const activeEnrolment = l.enrolments?.find((e: any) => e.status === 'active');
                const score = l.learner_progress?.[0]?.current_score ?? null;
                return (
                  <tr key={l.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 rounded-xl border border-slate-100">
                          <AvatarImage src={l.avatar} />
                          <AvatarFallback className="bg-orange-50 text-orange-600 font-semibold text-sm">
                            {l.first_name?.[0]}{l.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{l.first_name} {l.last_name}</p>
                          <p className="text-xs text-slate-400">{l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-700 font-medium">
                        {activeEnrolment?.courses?.name ?? (
                          <span className="text-slate-300 italic text-xs">Not enrolled</span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {score !== null ? (
                        <span className={cn('text-sm font-bold',
                          score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'
                        )}>
                          {score}%
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge className={cn('text-[9px] font-semibold uppercase border-none',
                        l.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                        l.status === 'suspended' ? 'bg-rose-50 text-rose-700' :
                        'bg-slate-50 text-slate-500'
                      )}>
                        {l.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-slate-400 font-medium">
                      {new Date(l.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-100">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-lg p-1 w-44">
                            <DropdownMenuItem
                              onClick={() => handleSuspend(l.id, l.status)}
                              className={cn('rounded-lg px-3 py-2 text-sm font-medium cursor-pointer',
                                l.status === 'suspended' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'
                              )}
                            >
                              {l.status === 'suspended' ? 'Reinstate Learner' : 'Suspend Learner'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No learners found</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20 text-xs text-slate-400 font-medium">
          Showing {filtered.length} of {learners.length} learners
        </div>
      </div>
    </div>
  );
}
