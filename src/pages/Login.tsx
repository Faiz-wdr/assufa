import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { supabase } from '@/supabase/supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (signInError) throw signInError;
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 text-left">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-caption font-bold text-neutral-textPrimary dark:text-white">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex h-[52px] w-full rounded-input border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-small text-neutral-textPrimary dark:text-white placeholder-neutral-textSecondary dark:placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          placeholder="admin@greenclass.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-caption font-bold text-neutral-textPrimary dark:text-white">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex h-[52px] w-full rounded-input border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-4 pr-12 py-3 text-small text-neutral-textPrimary dark:text-white placeholder-neutral-textSecondary dark:placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-textSecondary dark:text-neutral-500 hover:text-neutral-textPrimary dark:hover:text-white focus:outline-none disabled:opacity-50"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <button
        id="login-submit"
        type="submit"
        disabled={loading}
        className="flex h-[48px] w-full items-center justify-center rounded-btn bg-primary font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-hover disabled:opacity-50"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          'Sign In'
        )}
      </button>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => navigate('/support')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-neutral-textSecondary dark:text-neutral-400 hover:text-primary dark:hover:text-primary-hover transition-colors focus:outline-none disabled:opacity-50"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Contact Support</span>
        </button>
      </div>



      {/* <div className="mt-4 rounded-[12px] bg-slate-100/85 p-3 text-[10px] text-slate-500">
        <p className="font-bold text-slate-700 mb-1">Prepared for Future Expansion:</p>
        <ul className="list-disc pl-3.5 space-y-0.5 font-medium">
          <li>Database is fully indexed and multi-tenant.</li>
          <li>Auth architecture is ready for Phone OTP.</li>
        </ul>
      </div> */}
    </form>
  );
};
