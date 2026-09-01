import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, User as UserIcon, ShieldCheck } from "lucide-react";
import api from "../../api/axios";
import useAuthStore from "../../context/AuthStore";
import SparkLogo from "../../components/ui/SparkLogo";
import { Button } from "../../components/ui/Button";

export default function Login() {
  const [role, setRole] = useState("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email & password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res.data?.token || !res.data?.user) {
        toast.error("Invalid server response");
        return;
      }

      // Role Validation check
      if (res.data.user.role !== role) {
        toast.error(`Role mismatch! You are registered as a ${res.data.user.role}.`);
        setIsLoading(false);
        return;
      }

      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name} 🚀`);
      
      navigate(res.data.user.role === "admin" ? "/admin" : "/member");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#080c14] overflow-hidden p-4 selection:bg-emerald-500/30">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-950/20 relative">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-6">
            <SparkLogo size="lg" />
            <h2 className="text-2xl font-bold text-white tracking-tight mt-4 font-heading">
              Welcome Back!
            </h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Tab Selector */}
            <div className="flex p-1 bg-[#131d31] rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setRole("member")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === "member"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <UserIcon size={14} /> Member
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === "admin"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck size={14} /> Admin
              </button>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                Remember me
              </label>
              <a href="#" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 mt-2 text-sm"
              isLoading={isLoading}
            >
              Login
            </Button>
          </form>

          {/* Bottom Switch */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold ml-1">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
