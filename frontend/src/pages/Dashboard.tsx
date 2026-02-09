import { useMemo, useState } from 'react';
import { Phone, Clock, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { CallDetailModal } from '@/components/CallDetailModal';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Call } from '@/types';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { listCalls } from '@/api/calls';
import { getAnalyticsSummary } from '@/api/analytics';
import { createBusiness } from '@/api/businesses';
import { getApiErrorMessage } from '@/api/client';

export default function Dashboard() {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [createName, setCreateName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const businessId = user?.business_id || '';

  const callsQuery = useQuery({
    queryKey: ['calls', businessId],
    queryFn: () => listCalls({ business_id: businessId, limit: 10, offset: 0 }),
    enabled: Boolean(businessId),
  });
  const summaryQuery = useQuery({
    queryKey: ['analytics-summary', businessId],
    queryFn: () => getAnalyticsSummary(businessId, '30d'),
    enabled: Boolean(businessId),
  });

  const calls = callsQuery.data || [];
  const summary = summaryQuery.data;
  const activeCalls = useMemo(
    () => calls.filter((c) => !c.ended_at).length,
    [calls]
  );
  const todaysCalls = calls.length;
  const escalationsToday = calls.filter((c) => c.status === 'escalated').length;
  const avgDuration = useMemo(() => {
    if (!summary) return 0;
    return Math.round(summary.avg_duration || 0);
  }, [summary]);

  const handleCreateBusiness = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const business = await createBusiness({ name: createName, phone_number: createPhone });
      if (user) {
        setUser({ ...user, business_id: business.id });
      }
      setCreateName('');
      setCreatePhone('');
    } catch (err) {
      setCreateError(getApiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your AI call representative</p>
      </div>

      {!businessId && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-semibold">Create your business</h3>
          <p className="text-xs text-muted-foreground">
            A business is required to fetch calls and analytics.
          </p>
          {createError && (
            <div className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {createError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Business name"
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
            />
            <input
              value={createPhone}
              onChange={(e) => setCreatePhone(e.target.value)}
              placeholder="Business phone"
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
            />
          </div>
          <button
            onClick={handleCreateBusiness}
            disabled={!createName || !createPhone || creating}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Business'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatsCard title="Active Calls" value={activeCalls} icon={Activity} subtitle="Live now" trend={{ value: '2 more than avg', positive: true }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatsCard title="Today's Calls" value={todaysCalls} icon={Phone} trend={{ value: '+12%', positive: true }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsCard title="Escalations" value={escalationsToday} icon={AlertTriangle} trend={{ value: '-5%', positive: true }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatsCard title="Avg Duration" value={`${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`} icon={Clock} />
        </motion.div>
      </div>

      {/* Recent Calls */}
      <div className="glass-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Calls</h3>
          <a href="/calls" className="text-xs text-primary hover:underline">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Caller</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Summary</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr
                  key={call.id}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedCall(call)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{call.caller_number}</p>
                      <p className="text-xs text-muted-foreground">{call.caller_number}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {format(new Date(call.started_at), 'MMM d, h:mm a')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {Math.floor((call.duration_seconds || 0) / 60)}:{((call.duration_seconds || 0) % 60).toString().padStart(2, '0')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      !call.ended_at ? 'badge-live' : call.status === 'escalated' ? 'badge-escalated' : 'badge-completed'
                    )}>
                      {!call.ended_at && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-live" />}
                      {call.ended_at ? call.status : 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate hidden md:table-cell">
                    {call.summary || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!callsQuery.isLoading && calls.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">No calls yet.</div>
          )}
        </div>
      </div>

      <CallDetailModal call={selectedCall} open={!!selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
