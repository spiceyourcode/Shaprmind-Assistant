import { useState } from 'react';
import { Phone, Clock, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { CallDetailModal } from '@/components/CallDetailModal';
import { mockCalls } from '@/lib/mockData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Call } from '@/types';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const activeCalls = mockCalls.filter((c) => c.status === 'active').length;
  const todaysCalls = mockCalls.length;
  const escalationsToday = mockCalls.filter((c) => c.status === 'escalated').length;
  const avgDuration = Math.round(mockCalls.reduce((a, c) => a + c.duration, 0) / mockCalls.length);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your AI call representative</p>
      </div>

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
              {mockCalls.map((call) => (
                <tr
                  key={call.id}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedCall(call)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{call.caller_name || call.caller_number}</p>
                      <p className="text-xs text-muted-foreground">{call.caller_number}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {format(new Date(call.started_at), 'MMM d, h:mm a')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      call.status === 'active' ? 'badge-live' : call.status === 'escalated' ? 'badge-escalated' : 'badge-completed'
                    )}>
                      {call.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-live" />}
                      {call.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate hidden md:table-cell">
                    {call.summary || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CallDetailModal call={selectedCall} open={!!selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
