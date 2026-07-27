import { useState } from 'react';
import { Leaf, Lock, Mail, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from '@/context/RouterContext';
import { Reveal } from '@/components/ui/Reveal';

export default function AdminLoginPage() {
  const { signIn } = useAuth();
  const toast = useToast();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      toast.success('Welcome back, admin!');
      navigate('/admin');
    } catch (err) {
      toast.error('Invalid credentials. Please check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-grid relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/20" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-earth-200/40 blur-3xl dark:bg-earth-900/20" />

      <Reveal className="relative w-full max-w-md">
        <button onClick={() => navigate('/')} className="btn-ghost mb-6 -ml-3">
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="card overflow-hidden">
          <div className="border-b border-gray-100 bg-gradient-to-br from-brand-50 to-white px-7 py-8 text-center dark:border-gray-800 dark:from-brand-950/40 dark:to-gray-900">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-2xl bg-brand-200/50 animate-pulse-ring dark:bg-brand-900/40" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
                <ShieldCheck size={28} />
              </span>
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold text-gray-900 dark:text-white">Admin Sign In</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sign in to manage the disease knowledge base and prediction history.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-7">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="input-field px-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="border-t border-gray-100 px-7 py-4 dark:border-gray-800">
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-400 dark:text-gray-500">
              <Leaf size={13} className="text-brand-500" />
              Admin access only. Contact the developer for credentials.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
