'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_user_id?: string;
  target_id?: string;
  target_type?: string;
  details?: any;
  created_at: string;
  actor?: { first_name: string; last_name: string; email: string };
  target_user?: { first_name: string; last_name: string };
}

export default function AuditLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          actor:profiles!actor_id(first_name, last_name, email),
          target_user:profiles!target_user_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      setLogs(data ?? []);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const actionColor = (action: string) => {
    if (/creat|publish|enrol|approv/i.test(action)) return 'bg-emerald-50 text-emerald-700';
    if (/updat|edit|grade/i.test(action)) return 'bg-blue-50 text-blue-700';
    if (/delet|suspend|remov/i.test(action)) return 'bg-rose-50 text-rose-700';
    if (/payment|pay/i.test(action)) return 'bg-green-50 text-green-700';
    return 'bg-slate-50 text-slate-600';
  };

  const uniqueActions = ['all', ...new Set(logs.map(l => l.action))];

  const filtered = logs.filter(l => {
    const actor = `${l.actor?.first_name} ${l.actor?.last_name} ${l.actor?.email}`.toLowerCase();
    const matchSearch = actor.includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-lg" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/60">
        <Badge className="bg-slate-100 text-slate-600 border-slate-200 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider mb-2">
          Security
        </Badge>
        <h1 className="text-3xl font-medium tracking-tight text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 mt-1 text-sm">Immutable record of all administrative actions. Last 500 entries.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by actor or action..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-slate-50 border-none" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-11 w-52 rounded-xl bg-slate-50 border-none text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl max-h-64">
            {uniqueActions.map(a => (
              <SelectItem key={a} value={a} className="text-xs">{a === 'all' ? 'All Actions' : a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Activity className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-400 text-sm">No audit logs found</p>
          </div>
        ) : (
          filtered.map((log, i) => (
            <div key={log.id} className="flex gap-4 items-start">
              {/* Timeline dot */}
              <div className="flex flex-col items-center mt-2 gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" />
                {i < filtered.length - 1 && <div className="w-px h-8 bg-slate-100" />}
              </div>

              {/* Card */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn('text-[9px] font-semibold uppercase border-none', actionColor(log.action))}>
                      {log.action}
                    </Badge>
                    {log.target_type && (
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                        on {log.target_type}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">
                    {new Date(log.created_at).toLocaleString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Actor: </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {log.actor ? `${log.actor.first_name} ${log.actor.last_name}` : log.actor_id?.slice(0, 8)}
                    </span>
                  </div>
                  {log.target_user && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium">Target: </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {log.target_user.first_name} {log.target_user.last_name}
                      </span>
                    </div>
                  )}
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-[10px] text-slate-400 cursor-pointer select-none font-medium">
                      View details
                    </summary>
                    <pre className="mt-2 text-[10px] bg-slate-50 rounded-xl p-3 overflow-x-auto text-slate-600 font-mono">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-center text-xs text-slate-400 pt-4">
        Showing {filtered.length} of {logs.length} entries · Audit logs are immutable and cannot be deleted.
      </p>
    </div>
  );
}
