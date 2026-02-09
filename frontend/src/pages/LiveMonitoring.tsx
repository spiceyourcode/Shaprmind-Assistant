import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Radio, PhoneForwarded, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { listCalls } from '@/api/calls';
import { requestTakeover } from '@/services/socketService';

export default function LiveMonitoring() {
  const businessId = useAuthStore((s) => s.user?.business_id || '');
  const user = useAuthStore((s) => s.user);
  const [takeoverPhone, setTakeoverPhone] = useState(user?.phone || '');
  const callsQuery = useQuery({
    queryKey: ['calls', businessId, 'live'],
    queryFn: () => listCalls({ business_id: businessId, limit: 20, offset: 0 }),
    enabled: Boolean(businessId),
    refetchInterval: 5000,
  });
  const activeCalls = useMemo(
    () => (callsQuery.data || []).filter((c) => !c.ended_at),
    [callsQuery.data]
  );
  const [takingOver, setTakingOver] = useState<string | null>(null);

  const handleTakeover = (callId: string) => {
    if (!takeoverPhone) return;
    setTakingOver(callId);
    requestTakeover(callId, takeoverPhone);
    setTimeout(() => setTakingOver(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!businessId && (
        <div className="text-sm text-muted-foreground">
          Link a business to view live calls.
        </div>
      )}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2">
            Live Monitor
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse-live" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{activeCalls.length} active call{activeCalls.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="max-w-sm">
        <label className="text-xs font-medium text-muted-foreground">Takeover phone number</label>
        <input
          value={takeoverPhone}
          onChange={(e) => setTakeoverPhone(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
          placeholder="+15555550123"
        />
      </div>

      {activeCalls.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Radio className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No active calls right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {activeCalls.map((call) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-card p-5 border-l-2 border-l-success"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{call.caller_number}</p>
                    <p className="text-xs text-muted-foreground">{call.caller_number}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {Math.floor((call.duration_seconds || 0) / 60)}:{((call.duration_seconds || 0) % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                {/* Latest transcript */}
                {call.messages && call.messages.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-muted/30 text-sm">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">
                      {call.messages[call.messages.length - 1].sender === 'customer' ? 'Customer' : 'AI Rep'}
                    </p>
                    <p className="text-muted-foreground line-clamp-2">
                      {call.messages[call.messages.length - 1].content}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleTakeover(call.id)}
                  disabled={takingOver === call.id}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full justify-center',
                    takingOver === call.id
                      ? 'bg-success/20 text-success'
                      : 'bg-warning/15 text-warning hover:bg-warning/25'
                  )}
                >
                  <PhoneForwarded className="w-4 h-4" />
                  {takingOver === call.id ? 'Takeover Requested...' : 'Take Over Call'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Escalation Alerts */}
      <div className="glass-card">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Pending Escalations</h3>
        </div>
        <div className="p-4 space-y-3">
          {(callsQuery.data || []).filter(c => c.status === 'escalated').map((call) => (
            <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <p className="text-sm font-medium">{call.caller_number}</p>
                <p className="text-xs text-muted-foreground">{call.summary}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-destructive/15 text-destructive text-xs font-medium hover:bg-destructive/25 transition-colors">
                Accept
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
