import { useEffect, useState } from "react";
import { Folder, CheckSquare, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import useAuthStore from "../../context/AuthStore";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const [dashRes, tasksRes, projRes] = await Promise.all([
        api.get("/member/dashboard"),
        api.get("/tasks"),
        api.get("/projects"),
      ]);

      setStats(dashRes.data);
      setTasks(tasksRes.data.filter((t) => t.assignedTo?._id === user?._id || t.assignedTo === user?._id));
      setProjects(projRes.data);
    } catch (err) {
      console.error("Member Dashboard Error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const total = stats.assigned + stats.inProgress + stats.completed || 1;
  const completedPct = Math.round((stats.completed / total) * 100);
  const inProgressPct = Math.round((stats.inProgress / total) * 100);
  const todoPct = 100 - completedPct - inProgressPct;

  const donutData = [
    { name: "Completed", value: stats.completed, color: "#10b981", pct: completedPct },
    { name: "In Progress", value: stats.inProgress, color: "#3b82f6", pct: inProgressPct },
    { name: "To Do", value: stats.assigned, color: "#a855f7", pct: todoPct },
  ];

  const statCards = [
    {
      title: "Assigned Tasks",
      sub: "Awaiting start",
      value: stats.assigned,
      icon: CheckSquare,
      iconBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    {
      title: "In Progress",
      sub: "Currently working",
      value: stats.inProgress,
      icon: Clock,
      iconBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    {
      title: "Completed",
      sub: "Finished tasks",
      value: stats.completed,
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Projects",
      sub: "Active workspaces",
      value: projects.length,
      icon: Folder,
      iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#0f172a] border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-lg shadow-black/20"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${stat.iconBg}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight leading-tight">
                {loading ? <span className="inline-block w-8 h-6 bg-slate-800 animate-pulse rounded" /> : stat.value}
              </p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">{stat.title}</p>
              <p className="text-[11px] text-slate-500">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* My Tasks List */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-6 bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-black/20"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white tracking-tight font-heading">
                My Assigned Tasks
              </h2>
              <Link
                to="/member/tasks"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-800/50" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No tasks assigned to you yet.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 4).map((t) => (
                  <div
                    key={t._id}
                    className="bg-[#131d31] border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between transition-all"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-white">{t.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Project: {t.project?.name || "Workspace"}</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-5 mt-4 border-t border-slate-800/80">
            <Button
              onClick={() => navigate("/member/tasks")}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              Go to Task Board
            </Button>
          </div>
        </motion.div>

        {/* Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-6 bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-black/20"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white tracking-tight font-heading">
                Task Breakdown
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-2">
              <div className="sm:col-span-6 h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "10px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white leading-none">{tasks.length}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Tasks</span>
                </div>
              </div>

              <div className="sm:col-span-6 space-y-3.5">
                {donutData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-400">
                      <span className="text-white mr-1">{item.value}</span> ({item.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-800/80">
            <Button
              onClick={() => navigate("/admin/projects")}
              className="w-full text-xs py-2"
            >
              Browse Team Projects
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
