import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('admin@sharpmind.ai');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<'owner' | 'staff'>('owner');
  const [businessId, setBusinessId] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const { login, register, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      await register({
        email,
        password,
        role,
        business_id: role === 'staff' ? businessId : null,
        phone: phone || null,
      });
    } else {
      await login(email, password);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-4">
            <Brain className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sharp Mind AI Rep</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRegister ? 'Create your account' : 'Sign in to your dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'owner' | 'staff')}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="owner">Business Owner</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          )}
          {isRegister && role === 'staff' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Business ID</label>
              <input
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
          )}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-primary hover:underline">
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
