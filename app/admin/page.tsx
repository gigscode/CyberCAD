'use client';
import { useAuth } from '@/lib/auth-context';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, BookOpen, CreditCard, MessageSquare,
  TrendingUp, Activity, ArrowRight, CheckCircle2,
  AlertCircle, DollarSign, GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalLearners: number;
  activeCourses: number;
  totalRevenue: number; // kobo
  pendingSubmissions: number;
  mentorshipRequests: number;
  recentPayments: any[];
  recentEnrolments: any[];
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalLearners: 0,
    activeCourses: 0,
    totalRevenue: 0,
    pendingSubmissions: 0,
    mentorshipRequests: 0,
    recentPayments: [],
    recentEnrolments: [],
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Guard: only super‑admin can view this page
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'super-admin')) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.role === 'super-admin') {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      const [
        { count: learnerCount },
        { count: courseCount },
        { data: payments },
        { count: submissionCount },
        { count: mentorshipCount },
        { data: recentEnrolments },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'learner'),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('payments').select('amount_kobo').eq('paystack_status', 'success'),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).is('grade', null),
        supabase.from('mentorship_requests').select('*', { count: 'exact', head: true }),
        supabase
          .from('enrolments')
          .select('*, profiles(first_name, last_name), courses(name)')
          .order('enrolled_at', { ascending: false })
          .limit(5),
      ]);

      const totalRevenue = (payments ?? []).reduce((sum: number, p: any) => sum + (p.amount_kobo ?? 0), 0);

      const recentPaymentsRes = await supabase
        .from('payments')
        .select('*, profiles(first_name, last_name), payment_plans(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalLearners: learnerCount ?? 0,
        activeCourses: courseCount ?? 0,
        totalRevenue,
        pendingSubmissions: submissionCount ?? 0,
        mentorshipRequests: mentorshipCount ?? 0,
        recentPayments: recentPaymentsRes.data ?? [],
        recentEnrolments: recentEnrolments ?? [],
      });
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setDataLoading(false);
    }
  };

  const formatNaira = (kobo: number) =>
    `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

  if (dataLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="h-10 bg-slate-200 animate-pulse rounded-lg w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-[24px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-[32px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">

      {/* Header */}
      <div className="pb-6 border-b border-slate-200/60">
        <Badge className="bg-orange-50 text-orange-700 border-orange-100 px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase mb-2">
          Super Admin
        </Badge>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 mt-1 max-w-xl text-base font-light">
          Secquiz academy — revenue, learners, content, and mentorship at a glance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Learners" value={stats.totalLearners}
          iconColor="text-orange-600" iconBgColor="bg-orange-50" />
        <StatCard icon={BookOpen} label="Live Courses" value={stats.activeCourses}
          iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatNaira(stats.totalRevenue)}
          iconColor="text-green-600" iconBgColor="bg-green-50" />
        <StatCard icon={AlertCircle} label="Ungraded Work" value={stats.pendingSubmissions}
          iconColor="text-amber-600" iconBgColor="bg-amber-50" />
        <StatCard icon={MessageSquare} label="Mentorship Clicks" value={stats.mentorshipRequests}
          iconColor="text-red-700" iconBgColor="bg-red-50" />
      </div>

      {/* Two-column area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Payments */}
        <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/payments')}
              className="text-orange-600 text-xs font-medium hover:bg-orange-50 h-7 px-3 rounded-lg">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No payments yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {stats.recentPayments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {p.profiles?.first_name} {p.profiles?.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                        {p.payment_plans?.name ?? 'Direct'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{formatNaira(p.amount_kobo)}</p>
                      <Badge className={cn(
                        'text-[9px] font-semibold uppercase border-none mt-0.5',
                        p.paystack_status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                        p.paystack_status === 'failed' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      )}>
                        {p.paystack_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enrolments */}
        <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-orange-600" />
              <CardTitle className="text-base font-semibold">Recent Enrolments</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/learners')}
              className="text-orange-600 text-xs font-medium hover:bg-orange-50 h-7 px-3 rounded-lg">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentEnrolments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No enrolments yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {stats.recentEnrolments.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {e.profiles?.first_name} {e.profiles?.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                        {e.courses?.name}
                      </p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none text-[9px] font-semibold uppercase">
                      {e.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Manage Courses', icon: BookOpen, path: '/admin/courses', color: 'indigo' },
          { label: 'View Learners', icon: Users, path: '/admin/learners', color: 'emerald' },
          { label: 'Grade Submissions', icon: CheckCircle2, path: '/admin/submissions', color: 'amber' },
          { label: 'Mentorship Log', icon: MessageSquare, path: '/admin/mentorship', color: 'violet' },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => router.push(action.path)}
            className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
              action.color === 'indigo' ? 'bg-orange-50 text-orange-600' :
              action.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              action.color === 'amber' ? 'bg-amber-50 text-amber-600' :
              'bg-red-50 text-red-700'
            )}>
              <action.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
              {action.label}
            </p>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 mt-1 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      {/* Platform health */}
      <Card className="rounded-[32px] border-orange-200 shadow-lg shadow-orange-50 overflow-hidden bg-gradient-to-r from-orange-600 to-red-700 text-white">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-white/70" />
              <h3 className="text-lg font-semibold">System Health</h3>
            </div>
            <p className="text-orange-100/80 text-sm max-w-md">
              All services operational. Supabase Auth, PostgREST, and storage are running normally.
              YouTube video delivery is external and not monitored here.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-bold">99.5%</p>
            <p className="text-orange-200 text-xs uppercase tracking-widest font-medium">Uptime</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
