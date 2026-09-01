import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, FolderKanban, CheckSquare, ShieldCheck, ArrowRight,
  Sparkles, Layers, Lock, Cpu, Database, Code, CheckCircle2,
  Folder, ClipboardList
} from "lucide-react";
import useAuthStore from "../context/AuthStore";
import SparkLogo from "../components/ui/SparkLogo";
import { Button } from "../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token && user?.role) {
      navigate(user.role === "admin" ? "/admin" : "/member");
    }
  }, [token, user, navigate]);

  const features = [
    {
      icon: Users,
      title: "Role Based Access",
      desc: "Granular administrative and team member workflows with approval guards.",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      icon: FolderKanban,
      title: "Project & Board Management",
      desc: "Organize infinite projects with dynamic multi-column Kanban boards.",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    },
    {
      icon: CheckSquare,
      title: "Task Tracking & Organization",
      desc: "Drag-and-drop cards, priority badges, tags, and due date management.",
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Protected",
      desc: "Stateless JWT authentication, password hashing, and CORS protection.",
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
  ];

  const techStack = [
    { name: "React.js", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
    { name: "Node.js", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
    { name: "Express.js", color: "text-slate-200", bg: "bg-slate-500/10 border-slate-500/30" },
    { name: "MongoDB", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
    { name: "JWT", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
    { name: "Tailwind CSS", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30" },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-emerald-500/30 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-800/80 px-6 sm:px-12 flex items-center justify-between bg-[#080c14]/80 backdrop-blur-md sticky top-0 z-50">
        <SparkLogo size="md" />

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            Sign In
          </Link>
          <Button onClick={() => navigate("/register")} size="sm" className="px-5">
            Get Started
          </Button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, Subtitle, Feature Pillars */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-8"
          >
            <div>
              <SparkLogo size="xl" />
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-emerald-400 uppercase mt-3 font-heading">
                Task Management Platform
              </h2>
              <p className="text-base sm:text-lg text-slate-400 mt-4 leading-relaxed max-w-xl">
                A full-stack role-based task management platform to organize projects, boards, and tasks efficiently.
              </p>
            </div>

            {/* 4 Feature Pillars Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-[#0f172a] border border-slate-800/80 hover:border-emerald-500/40 p-4 rounded-2xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <f.icon className="text-emerald-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-snug line-clamp-2">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                onClick={() => navigate("/register")}
                size="lg"
                className="gap-2 px-7 shadow-xl shadow-emerald-500/20"
              >
                Launch Workspace <ArrowRight size={18} />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/login")}
                className="px-7"
              >
                Member / Admin Sign In
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Interactive UI Showcase Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/20 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">spark.app/dashboard</span>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Live Preview
                </span>
              </div>

              {/* 4 Stat Cards Mockup */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-[#131d31] border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Folder size={16} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-tight">8</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Projects</p>
                  </div>
                </div>

                <div className="bg-[#131d31] border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-tight">24</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Boards</p>
                  </div>
                </div>

                <div className="bg-[#131d31] border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <CheckSquare size={16} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-tight">56</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Tasks</p>
                  </div>
                </div>

                <div className="bg-[#131d31] border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-tight">12</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Members</p>
                  </div>
                </div>
              </div>

              {/* Kanban Column Preview */}
              <div className="grid grid-cols-3 gap-3">
                {/* To Do */}
                <div className="bg-[#131d31] border border-slate-800/80 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300">To Do</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">3</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-[#1e293b] p-2.5 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-semibold uppercase">High</span>
                        <span className="text-[10px] text-slate-400 font-medium">John</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-snug">Create wireframes</p>
                    </div>
                    <div className="bg-[#1e293b] p-2.5 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold uppercase">Medium</span>
                        <span className="text-[10px] text-slate-400 font-medium">Sarah</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-snug">Design landing page</p>
                    </div>
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-[#131d31] border border-slate-800/80 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300">In Progress</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">2</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-[#1e293b] p-2.5 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-semibold uppercase">High</span>
                        <span className="text-[10px] text-slate-400 font-medium">John</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-snug">Develop homepage</p>
                    </div>
                    <div className="bg-[#1e293b] p-2.5 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold uppercase">Medium</span>
                        <span className="text-[10px] text-slate-400 font-medium">Mike</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-snug">Integrate API</p>
                    </div>
                  </div>
                </div>

                {/* Done */}
                <div className="bg-[#131d31] border border-slate-800/80 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300">Done</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">3</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-[#1e293b] p-2.5 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold uppercase">Low</span>
                        <span className="text-[10px] text-slate-400 font-medium">Sarah</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-snug">Research & planning</p>
                    </div>
                    <div className="bg-[#1e293b] p-2.5 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold uppercase">Low</span>
                        <span className="text-[10px] text-slate-400 font-medium">Mike</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-snug">UI/UX Brainstorming</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Bottom Tech Stack & Security Bar */}
      <footer className="border-t border-slate-800/80 bg-[#0b101b] py-6 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Tech stack pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mr-2">Tech Stack:</span>
            {techStack.map((t, idx) => (
              <span
                key={idx}
                className={`text-xs font-semibold px-3 py-1 rounded-lg border ${t.bg} ${t.color}`}
              >
                {t.name}
              </span>
            ))}
          </div>

          {/* Security feature badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" /> JWT Authentication
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" /> Role Based Access
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" /> Secure API Endpoints
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
