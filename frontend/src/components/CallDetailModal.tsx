import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Call } from '@/types';
import { format } from 'date-fns';
import { Phone, Clock, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface CallDetailModalProps {
  call: Call | null;
  open: boolean;
  onClose: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function SentimentDot({ sentiment }: { sentiment?: number }) {
  if (sentiment === undefined) return null;
  const color = sentiment > 0.3 ? 'bg-success' : sentiment < -0.3 ? 'bg-destructive' : 'bg-warning';
  return <span className={cn('w-2 h-2 rounded-full inline-block', color)} />;
}

export function CallDetailModal({ call, open, onClose }: CallDetailModalProps) {
  if (!call) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <span>{call.caller_number}</span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              !call.ended_at ? 'badge-live' : call.status === 'escalated' ? 'badge-escalated' : 'badge-completed'
            )}>
              {call.ended_at ? call.status : 'active'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 text-xs text-muted-foreground border-b border-border pb-3">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(call.duration_seconds || 0)}</span>
          <span>{format(new Date(call.started_at), 'MMM d, yyyy h:mm a')}</span>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {/* Transcript */}
          {call.messages && call.messages.length > 0 && (
            <section className="mb-6">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Transcript</h4>
              <div className="space-y-3">
                {call.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.sender === 'customer' ? 'justify-start' : 'justify-end'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] px-3 py-2 rounded-xl text-sm',
                        msg.sender === 'customer'
                          ? 'bg-muted text-foreground rounded-bl-none'
                          : 'bg-primary/15 text-foreground rounded-br-none'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                          {msg.sender === 'customer' ? 'Customer' : 'AI Rep'}
                        </span>
                        <SentimentDot sentiment={msg.sentiment_score ?? undefined} />
                      </div>
                      <p>{msg.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(msg.timestamp), 'h:mm:ss a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Events Timeline */}
          {call.events && call.events.length > 0 && (
            <section className="mb-6">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Events</h4>
              <div className="space-y-2">
                {call.events.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 text-sm">
                    <div className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      event.type === 'escalation_detected' ? 'bg-destructive' : 'bg-primary'
                    )} />
                    <span className="text-foreground">{event.description}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{format(new Date(event.timestamp), 'h:mm:ss a')}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Action Points */}
          {call.action_points && (
            <section className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Action Points</h4>
              <pre className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 overflow-auto">
                {JSON.stringify(call.action_points, null, 2)}
              </pre>
            </section>
          )}

          {call.summary && (
            <section className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">{call.summary}</p>
            </section>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
