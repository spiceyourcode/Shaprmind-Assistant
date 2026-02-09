import { useMemo, useState } from 'react';
import { Users as UsersIcon, Plus, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, deleteUser, listUsers } from '@/api/users';
import { getApiErrorMessage } from '@/api/client';

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'staff'>('staff');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    enabled: Boolean(currentUser),
  });
  const users = usersQuery.data || [];

  const createUserMutation = useMutation({
    mutationFn: () => createUser({ email, password, role, phone: phone || null }),
    onSuccess: () => {
      setShowModal(false);
      setEmail('');
      setPassword('');
      setRole('staff');
      setPhone('');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const canManageUsers = useMemo(() => currentUser?.role === 'owner', [currentUser?.role]);

  return (
    <div className="space-y-6 animate-fade-in">
      {!canManageUsers && (
        <div className="text-sm text-muted-foreground">
          Only owners can manage users.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!canManageUsers}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
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
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs capitalize">{user.role}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.phone}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button
                      onClick={() => deleteUserMutation.mutate(user.id)}
                      disabled={!canManageUsers || user.id === currentUser?.id}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !usersQuery.isLoading && (
          <div className="text-center py-12 text-muted-foreground">No users found</div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UsersIcon className="w-5 h-5 text-primary" /> Add User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                type="email"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                type="password"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'owner' | 'staff')}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  type="tel"
                />
              </div>
            </div>
            <button
              onClick={() => createUserMutation.mutate()}
              disabled={!email || !password || createUserMutation.isPending}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createUserMutation.isPending ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
