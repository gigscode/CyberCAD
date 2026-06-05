'use client';

import { useState, useEffect } from 'react';
import { TopHeader } from '@/components/top-header';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Users, AlertCircle, UserCheck, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function LearnersPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [learners, setLearners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchLearners(); }, []);

  const fetchLearners = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, enrolments(id, status, courses(name)), learner_progress(current_score)')
        .eq('role', 'learner')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLearners(data ?? []);
    } catch {
      toast.error('Failed to load learners');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = learners.filter(l =>
    `${l.first_name} ${l.last_name} ${l.email ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const active = learners.filter(l => l.status === 'active').length;
  const enrolled = learners.filter(l => l.enrolments?.some((e: any) => e.status === 'active')).length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl md:text-4xl font-bold text-slate-900 tracking-tight">Learners</h1>
          <p className="text-slate-500 mt-2 font-medium">All registered learners on the platform</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={Users} label="Total Learners" value={learners.length}
            iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
          <StatCard icon={UserCheck} label="Active Accounts" value={active}
            iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
          <StatCard icon={AlertCircle} label="Enrolled" value={enrolled}
            iconColor="text-amber-600" iconBgColor="bg-amber-50" />
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="relative max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search learners..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-slate-50 border-none" />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-slate-100 rounded" />
                    <div className="h-3 w-56 bg-slate-100 rounded" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No learners found</p>
              </div>
            ) : filtered.map(l => {
              const activeEnrolment = l.enrolments?.find((e: any) => e.status === 'active');
              const score = l.learner_progress?.[0]?.current_score ?? null;
              return (
                <div key={l.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  <Avatar className="w-12 h-12 rounded-xl border border-slate-100">
                    <AvatarFallback className="bg-indigo-50 text-indigo-600 font-semibold">
                      {l.first_name?.[0]}{l.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{l.first_name} {l.last_name}</p>
                    <p className="text-xs text-slate-400">{l.email ?? l.id}</p>
                    {activeEnrolment && (
                      <p className="text-xs text-indigo-600 font-medium mt-0.5">{activeEnrolment.courses?.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {score !== null && (
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                          <span>Score</span><span>{score}%</span>
                        </div>
                        <Progress value={score} className="h-1.5" />
                      </div>
                    )}
                    <Badge className={cn('text-[9px] font-semibold uppercase border-none',
                      l.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                      l.status === 'suspended' ? 'bg-rose-50 text-rose-700' :
                      'bg-slate-50 text-slate-500'
                    )}>
                      {l.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
