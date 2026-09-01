import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Plus, Search, Filter, Trash2, Edit2, Clock, User, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";

export default function AdminTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingTask, setEditingTask] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [updatedAssignedTo, setUpdatedAssignedTo] = useState("");
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [updatedPriority, setUpdatedPriority] = useState("normal");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
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
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      console.error("Failed to load users");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setUpdatedTitle(task.title || "");
    setUpdatedDescription(task.description || "");
    setUpdatedAssignedTo(task.assignedTo?._id || "");
    setUpdatedStatus(task.status || "todo");
    setUpdatedPriority(task.priority || "normal");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put(`/tasks/${editingTask._id}`, {
        title: updatedTitle,
        description: updatedDescription,
        assignedTo: updatedAssignedTo || null,
        status: updatedStatus,
        priority: updatedPriority,
      });

      toast.success("Task updated");
      setEditingTask(null);
      fetchTasks();
    } catch {
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Delete failed");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "todo":
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">To Do</span>;
      case "progress":
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">In Progress</span>;
      case "completed":
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Completed</span>;
      default:
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{status}</span>;
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
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Track, assign, and manage all organization items</p>
        </div>

        <Button
          onClick={() => navigate("/admin/create-task")}
          size="sm"
          className="gap-1.5 px-4 shadow-lg shadow-emerald-600/20 self-start sm:self-auto"
        >
          <Plus size={15} /> Create Task
        </Button>
      </div>

      {/* Filter Bar */}
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

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-18 w-full rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="bg-[#0f172a] hover:bg-[#131d31] border border-slate-800/90 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between transition-all group shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="font-semibold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
                    {task.title}
                  </h3>
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>

                {task.description && (
                  <p className="text-xs text-slate-400 mb-2 line-clamp-1">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300">
                      {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    {task.assignedTo?.name || "Unassigned"}
                  </span>
                  <span>•</span>
                  <span>Project: {task.project?.name || "Workspace"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800/60 transition-colors"
                  title="Edit Task"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={(e) => handleDelete(task._id, e)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">Task Title</label>
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">Description</label>
            <textarea
              className="w-full bg-[#131d31] border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs resize-none"
              rows="2"
              value={updatedDescription}
              onChange={(e) => setUpdatedDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">Status</label>
              <select
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white text-xs"
              >
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">Priority</label>
              <select
                value={updatedPriority}
                onChange={(e) => setUpdatedPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white text-xs"
              >
                <option value="low">🟢 Low</option>
                <option value="normal">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">Assigned Member</label>
            <select
              value={updatedAssignedTo}
              onChange={(e) => setUpdatedAssignedTo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white text-xs"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="flex-1 shadow-lg shadow-emerald-600/20" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
