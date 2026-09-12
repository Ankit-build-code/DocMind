'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
      {met ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {text}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
  };
  const passwordValid = Object.values(rules).every(Boolean);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!passwordValid) {
      toast.error('Please meet all password requirements.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/register', { email, password });
      toast.success('Account created! Please sign in.');
      router.push('/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Registration failed. Email may already be in use.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-700 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">DocMind</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">Your documents, finally answerable.</h2>
          <p className="text-brand-200 text-base leading-relaxed mb-8">
            Upload any PDF or text file and instantly ask questions. DocMind retrieves the right passages in under 10ms and generates a grounded, cited answer.
          </p>
          <div className="bg-white/10 rounded-xl p-5 border border-white/20">
            <p className="text-xs text-brand-300 mb-1 uppercase tracking-wide font-semibold">Live example</p>
            <p className="text-sm font-medium mb-3">&ldquo;What are the key deliverables in section 3?&rdquo;</p>
            <div className="h-px bg-white/20 mb-3" />
            <p className="text-xs text-brand-200">Retrieved in <span className="text-white font-semibold">7ms</span> · Source: project_spec.pdf · Section 3.2</p>
          </div>
        </div>

        <p className="text-brand-300 text-xs">
          YC Fall 2026 × Moss: The Zero Latency Builder Sprint
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">DocMind</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500">Start talking to your documents for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password rules — show when user starts typing */}
              {password.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <PasswordRule met={rules.length} text="Min 8 characters" />
                  <PasswordRule met={rules.upper} text="1 uppercase letter" />
                  <PasswordRule met={rules.digit} text="1 number" />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !passwordValid}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center mt-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
