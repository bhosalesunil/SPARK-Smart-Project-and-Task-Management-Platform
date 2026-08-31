import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const Login = () => {
  const [role, setRole] = useState('MEMBER'); // 'MEMBER' or 'ADMIN'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ email, password, role });
      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/member');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to log in. Please verify your credentials and role.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Top Back Link */}
      <div className="w-full max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-[#121622] border border-[#1E2436] rounded-2xl p-8 shadow-2xl relative">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-primary/30 mb-4">
              S
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-xs text-slate-400">
              Enter your credentials to access SPARK
            </p>
          </div>

          {/* Role Selector Pill */}
          <div className="bg-[#0E111A] p-1 rounded-xl border border-[#1E2436] flex mb-6">
            <button
              type="button"
              onClick={() => setRole('MEMBER')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'MEMBER'
                  ? 'bg-[#1C2033] text-white shadow-sm border border-primary/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'ADMIN'
                  ? 'bg-[#1C2033] text-white shadow-sm border border-primary/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full spark-input pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full spark-input pl-10 pr-10 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#1E2436] bg-[#0E111A] text-primary focus:ring-0 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset instructions will be sent to your registered email.');
                }}
                className="text-primary hover:text-primary-light transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full mt-2 font-semibold bg-gradient-to-r from-primary to-accent-purple hover:from-primary-hover hover:to-primary"
            >
              {loading ? 'Signing in...' : 'Sign in to Dashboard'}
            </Button>
          </form>

          {/* Footer Register Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-primary hover:text-primary-light font-medium">
              Create an account
            </Link>
          </div>

          {/* Quick Demo Logins Helper */}
          <div className="mt-6 pt-4 border-t border-[#1E2436]/60 text-center">
            <span className="text-[11px] text-slate-500 block mb-2">Demo Credentials:</span>
            <div className="flex justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@test.com');
                  setPassword('password123');
                  setRole('ADMIN');
                }}
                className="text-[11px] px-2.5 py-1 bg-[#1E2436] hover:bg-slate-700 text-slate-300 rounded"
              >
                Admin (Demof)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('mem1@test.com');
                  setPassword('password123');
                  setRole('MEMBER');
                }}
                className="text-[11px] px-2.5 py-1 bg-[#1E2436] hover:bg-slate-700 text-slate-300 rounded"
              >
                Member (Mem1)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 pb-2">
        SPARK Project Management System &copy; 2026
      </div>
    </div>
  );
};
