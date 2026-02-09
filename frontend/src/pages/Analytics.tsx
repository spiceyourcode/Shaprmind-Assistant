import { useState } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { Phone, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { getAnalyticsSummary } from '@/api/analytics';

const CHART_COLORS = ['hsl(175, 80%, 45%)', 'hsl(210, 70%, 50%)', 'hsl(38, 85%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(220, 10%, 50%)'];

export default function Analytics() {
  const [period, setPeriod] = useState('7d');
  const businessId = useAuthStore((s) => s.user?.business_id || '');
  const summaryQuery = useQuery({
    queryKey: ['analytics-summary', businessId, period],
    queryFn: () => getAnalyticsSummary(businessId, period),
    enabled: Boolean(businessId),
  });
  const data = summaryQuery.data;

  return (
    <div className="space-y-6 animate-fade-in">
      {!businessId && (
        <div className="text-sm text-muted-foreground">
          Link a business to load analytics.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance metrics and insights</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Calls" value={(data?.total_calls || 0).toLocaleString()} icon={Phone} trend={{ value: '+8%', positive: true }} />
        <StatsCard title="Avg Sentiment" value={`${((data?.sentiment_avg || 0) * 100).toFixed(0)}%`} icon={TrendingUp} trend={{ value: '+3%', positive: true }} />
        <StatsCard title="Escalation Rate" value={`${((data?.escalation_rate || 0) * 100).toFixed(1)}%`} icon={AlertTriangle} trend={{ value: '-2%', positive: true }} />
        <StatsCard title="Avg Handle Time" value={`${Math.floor((data?.avg_duration || 0) / 60)}m ${(data?.avg_duration || 0) % 60}s`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Call Volume */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Call Volume</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="count" stroke="hsl(175, 80%, 45%)" strokeWidth={2} dot={{ fill: 'hsl(175, 80%, 45%)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">Chart data requires backend analytics series.</p>
        </div>

        {/* Escalation Reasons */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Escalation Reasons</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={[]} dataKey="count" nameKey="reason" cx="50%" cy="50%" outerRadius={90} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">Chart data requires backend analytics series.</p>
        </div>

        {/* Duration by Day */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Average Duration by Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${Math.floor(v / 60)}m`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`${Math.floor(v / 60)}m ${v % 60}s`, 'Avg Duration']} />
              <Bar dataKey="avg_duration" fill="hsl(175, 80%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">Chart data requires backend analytics series.</p>
        </div>
      </div>
    </div>
  );
}
