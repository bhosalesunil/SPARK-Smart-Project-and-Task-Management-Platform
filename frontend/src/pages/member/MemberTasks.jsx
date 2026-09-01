import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CheckSquare, Search, Filter, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import useAuthStore from "../../context/AuthStore";
import { Skeleton } from "../../components/ui/Skeleton";

export default function MemberTasks() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let result = tasks;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.title?.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    setFilteredTasks(result);
  }, [searchQuery, statusFilter, tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      const myTasks = res.data.filter(
        (t) => t.assignedTo?._id === user?._id || t.assignedTo === user?._id
      );
      setTasks(myTasks);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success("Task updated ✨");
      fetchTasks();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">High</span>;
      case "medium":
      case "normal":
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Medium</span>;
      case "low":
      default:
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight font-heading">
          My Tasks
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage tasks assigned directly to you</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="relative min-w-[150px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">No assigned tasks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t._id}
              className="bg-[#0f172a] hover:bg-[#131d31] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md shadow-black/20"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="font-semibold text-white text-sm truncate">{t.title}</h3>
                  {getPriorityBadge(t.priority)}
                </div>

                {t.description && (
                  <p className="text-xs text-slate-400 mb-2 line-clamp-1">{t.description}</p>
                )}

                <div className="text-xs text-slate-400">
                  Project: <span className="text-slate-200 font-medium">{t.project?.name || "Workspace"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t._id, e.target.value)}
                  className="px-3 py-1.5 bg-[#131d31] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="todo">To Do</option>
                  <option value="progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
