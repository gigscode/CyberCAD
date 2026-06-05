'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/stat-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, CreditCard, TrendingUp, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, profiles(first_name, last_name, email), payment_plans(name), courses(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPayments(data ?? []);
    } catch (e: any) {
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNaira = (kobo: number) =>
    `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

  const successful = payments.filter(p => p.paystack_status === 'success');
  const totalRevenue = successful.reduce((s, p) => s + (p.amount_kobo ?? 0), 0);

  const filtered = payments.filter(p => {
    const name = `${p.profiles?.first_name} ${p.profiles?.last_name} ${p.profiles?.email}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) ||
      p.paystack_reference?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.paystack_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusIcon = (s: string) => {
    if (s === 'success') return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (s === 'failed') return <XCircle className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-lg" />
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
        <Badge className="bg-green-50 text-green-700 border-green-100 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider mb-2">
          Revenue
        </Badge>
        <h1 className="text-3xl font-medium tracking-tight text-slate-900">Payments</h1>
        <p className="text-slate-500 mt-1 text-sm">All Paystack transactions across all plans.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatNaira(totalRevenue)}
          iconColor="text-green-600" iconBgColor="bg-green-50" />
        <StatCard icon={CreditCard} label="Successful Payments" value={successful.length}
          iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
        <StatCard icon={TrendingUp} label="Total Transactions" value={payments.length}
          iconColor="text-orange-600" iconBgColor="bg-orange-50" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search by name or reference..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-slate-50 border-none" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-44 rounded-xl bg-slate-50 border-none text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                {['Learner', 'Plan / Course', 'Reference', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">{p.profiles?.first_name} {p.profiles?.last_name}</p>
                    <p className="text-xs text-slate-400">{p.profiles?.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                    {p.payment_plans?.name ?? p.courses?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-[11px] bg-slate-50 px-2 py-0.5 rounded-lg text-slate-500 font-mono">
                      {p.paystack_reference?.slice(0, 16)}…
                    </code>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatNaira(p.amount_kobo)}</td>
                  <td className="px-5 py-4">
                    <Badge className={cn('text-[9px] font-semibold uppercase border-none flex items-center gap-1 w-fit',
                      p.paystack_status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                      p.paystack_status === 'failed' ? 'bg-rose-50 text-rose-700' :
                      'bg-amber-50 text-amber-700'
                    )}>
                      {statusIcon(p.paystack_status)} {p.paystack_status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 font-medium">
                    {new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payments found</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20 text-xs text-slate-400 font-medium">
          Showing {filtered.length} of {payments.length} transactions
        </div>
      </div>
    </div>
  );
}
