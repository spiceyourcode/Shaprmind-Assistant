import { useState } from 'react';
import { Users as UsersIcon, Plus, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const mockUsers = [
  { id: '1', email: 'admin@sharpmind.ai', role: 'owner', phone: '+1 (555) 000-0001' },
  { id: '2', email: 'sarah@sharpmind.ai', role: 'staff', phone: '+1 (555) 000-0002' },
  { id: '3', email: 'mike@sharpmind.ai', role: 'staff', phone: '+1 (555) 000-0003' },
];

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs capitalize">{user.role}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.phone}</td>
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
            <DialogTitle className="flex items-center gap-2"><UsersIcon className="w-5 h-5 text-primary" /> Add User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" type="email" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <select className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="staff">Staff</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <input className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" type="tel" />
              </div>
            </div>
            <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Add User
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
