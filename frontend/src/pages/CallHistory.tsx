import { useMemo, useState } from 'react';
import { CallDetailModal } from '@/components/CallDetailModal';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Search, Download } from 'lucide-react';
import type { Call } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { listCalls } from '@/api/calls';

export default function CallHistory() {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const businessId = useAuthStore((s) => s.user?.business_id || '');

  const callsQuery = useQuery({
    queryKey: ['calls', businessId, 'history'],
    queryFn: () => listCalls({ business_id: businessId, limit: 50, offset: 0 }),
    enabled: Boolean(businessId),
  });
  const calls = callsQuery.data || [];

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      const matchSearch = !search || c.caller_number.includes(search);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? !c.ended_at : c.status === statusFilter);
      return matchSearch && matchStatus;
    });
  }, [calls, search, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {!businessId && (
        <div className="text-sm text-muted-foreground">
          Link a business to view call history.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Call History</h1>
          <p className="text-sm text-muted-foreground mt-1">{calls.length} total calls</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search by caller number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Caller</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Escalated To</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((call) => (
              <tr key={call.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedCall(call)}>
                <td className="px-4 py-3">
                  <p className="font-medium">{call.caller_number}</p>
                  <p className="text-xs text-muted-foreground">{call.caller_number}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(call.started_at), 'MMM d, yyyy h:mm a')}</td>
                <td className="px-4 py-3 text-muted-foreground">{Math.floor((call.duration_seconds || 0) / 60)}:{((call.duration_seconds || 0) % 60).toString().padStart(2, '0')}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    !call.ended_at ? 'badge-live' : call.status === 'escalated' ? 'badge-escalated' : 'badge-completed'
                  )}>{call.ended_at ? call.status : 'active'}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{call.escalated_to_user_id || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No calls found</div>
        )}
      </div>

      <CallDetailModal call={selectedCall} open={!!selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
