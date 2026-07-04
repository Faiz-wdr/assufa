import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/supabase/supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        email,
        password,
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
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-caption font-bold text-neutral-textPrimary">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex h-[52px] w-full rounded-input border border-neutral-border bg-white px-4 py-3 text-small placeholder-neutral-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          placeholder="admin@greenclass.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-caption font-bold text-neutral-textPrimary">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          disabled={loading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex h-[52px] w-full rounded-input border border-neutral-border bg-white px-4 py-3 text-small placeholder-neutral-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          placeholder="••••••••"
        />
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
