import { useState } from 'react';
import { mockCustomers } from '@/lib/mockData';
import { Search, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CustomerProfile } from '@/types';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);

  const filtered = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.caller_number.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Customer profiles and preferences</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search by name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Call</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Calls</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{customer.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{customer.caller_number}</td>
                <td className="px-4 py-3 text-muted-foreground">{customer.last_call || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{customer.call_count}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditingCustomer(customer)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                <input defaultValue={editingCustomer.name} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Preferences (JSON)</label>
                <textarea
                  defaultValue={JSON.stringify(editingCustomer.preferences, null, 2)}
                  className="w-full h-32 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                />
              </div>
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
