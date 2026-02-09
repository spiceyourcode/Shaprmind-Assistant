import { useState } from 'react';
import { mockEscalationRules } from '@/lib/mockData';
import { ShieldAlert, Plus, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EscalationRules() {
  const [rules, setRules] = useState(mockEscalationRules);
  const [showModal, setShowModal] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = () => {
    const matched = rules.find((r) => r.keywords.some((k) => testInput.toLowerCase().includes(k.toLowerCase())));
    setTestResult(matched ? `Matched rule: "${matched.keywords.join(', ')}" — Priority ${matched.priority}, Action: ${matched.action_type}` : 'No rules matched.');
  };

  const priorityColor = (p: number) => {
    if (p <= 1) return 'text-destructive';
    if (p <= 2) return 'text-warning';
    return 'text-info';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Escalation Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure when calls get escalated</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      {/* Test Rule */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3">Test Escalation Detection</h3>
        <div className="flex gap-2">
          <input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type a message to test..."
            className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button onClick={handleTest} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            Test
          </button>
        </div>
        {testResult && (
          <p className={cn('text-sm mt-2', testResult.includes('Matched') ? 'text-warning' : 'text-muted-foreground')}>
            {testResult}
          </p>
        )}
      </div>

      {/* Rules Table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Keywords</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Notify</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {rule.keywords.map((k) => (
                      <span key={k} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{k}</span>
                    ))}
                  </div>
                </td>
                <td className={cn('px-4 py-3 font-semibold', priorityColor(rule.priority))}>P{rule.priority}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{rule.action_type}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {rule.notify_users.map((u) => (
                      <span key={u} className="text-xs text-muted-foreground">{u}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-primary" /> New Escalation Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Keywords (comma-separated)</label>
              <input className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="refund, charge, billing" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <select className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {[1,2,3,4,5].map(p => <option key={p} value={p}>P{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Action Type</label>
                <select className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="notify">Notify</option>
                  <option value="transfer">Transfer</option>
                  <option value="escalate">Escalate</option>
                </select>
              </div>
            </div>
            <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Create Rule
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
