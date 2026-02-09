import { useState } from 'react';
import { Search, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CustomerProfile } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useMutation } from '@tanstack/react-query';
import { getCustomerProfile, updateCustomerProfile } from '@/api/customers';
import { getApiErrorMessage } from '@/api/client';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);
  const [results, setResults] = useState<CustomerProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const businessId = useAuthStore((s) => s.user?.business_id || '');

  const lookup = useMutation({
    mutationFn: () => getCustomerProfile(search, businessId),
    onSuccess: (profile) => {
      setResults([profile]);
      setError(null);
    },
    onError: (err) => {
      setResults([]);
      setError(getApiErrorMessage(err));
    },
  });

  const save = useMutation({
    mutationFn: (payload: { id: string; name?: string | null; preferences?: Record<string, unknown> | null }) =>
      updateCustomerProfile(payload.id, { name: payload.name, preferences: payload.preferences }),
    onSuccess: (profile) => {
      setResults([profile]);
      setEditingCustomer(profile);
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {!businessId && (
        <div className="text-sm text-muted-foreground">
          Link a business to search customers.
        </div>
      )}
      <div>
        <h1 className="page-header">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Customer profiles and preferences</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search by caller number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <button
        onClick={() => lookup.mutate()}
        disabled={!search || !businessId || lookup.isPending}
        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium w-fit disabled:opacity-50"
      >
        {lookup.isPending ? 'Searching...' : 'Search'}
      </button>
      {error && <div className="text-xs text-destructive">{error}</div>}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Updated</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((customer) => (
              <tr key={customer.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{customer.name || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{customer.caller_number}</td>
                <td className="px-4 py-3 text-muted-foreground">{customer.updated_at || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditingCustomer(customer)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && !lookup.isPending && (
          <div className="text-center py-10 text-muted-foreground text-sm">No customer loaded.</div>
        )}
      </div>

      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <input
                  defaultValue={editingCustomer.name || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Preferences (JSON)</label>
                <textarea
                  defaultValue={JSON.stringify(editingCustomer.preferences || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditingCustomer({ ...editingCustomer, preferences: parsed });
                    } catch {
                      return;
                    }
                  }}
                  className="w-full h-32 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                />
              </div>
              <button
                onClick={() =>
                  save.mutate({
                    id: editingCustomer.id,
                    name: editingCustomer.name || null,
                    preferences: editingCustomer.preferences || {},
                  })
                }
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
