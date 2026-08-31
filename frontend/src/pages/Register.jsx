import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);

    try {
      const data = await register({ name, email, password, role });
      if (data.requiresApproval) {
        setSuccessMsg(
          'Registration submitted successfully! Your account is now pending Admin approval. You can sign in once an administrator approves your account.'
        );
      } else {
        navigate(data.user.role === 'ADMIN' ? '/admin' : '/member');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
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
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-[#121622] border border-[#1E2436] rounded-2xl p-8 shadow-2xl relative">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-primary/30 mb-4">
              S
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Create an account</h2>
            <p className="text-xs text-slate-400">
              Join SPARK and start managing workflows
            </p>
          </div>

          {/* Success Message for Pending Approval */}
          {successMsg ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Account Created</span>
              </div>
              <p>{successMsg}</p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Role Selection */}
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
                  Member (Requires Approval)
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

              {error && (
                <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full spark-input pl-10 pr-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

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

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full spark-input pl-10 pr-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#0E111A] rounded-lg border border-[#1E2436] text-[11px] text-slate-400">
                  ⚡ Note: New member accounts require verification & approval from an organization Administrator before full access.
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full mt-2 font-semibold bg-gradient-to-r from-primary to-accent-purple"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-400">
                <span>Already have an account? </span>
                <Link to="/login" className="text-primary hover:text-primary-light font-medium">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 pb-2">
        SPARK Project Management System &copy; 2026
      </div>
    </div>
  );
};
