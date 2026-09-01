import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";

export default function AdminCreateTask() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch {
      toast.error("Failed to load projects");
    }
  };

  const fetchMembers = async (pid) => {
    if (!pid) {
      setMembers([]);
      setAssignedTo("");
      return;
    }
    try {
      const res = await api.get(`/projects/${pid}`);
      setMembers(res.data.members || []);
    } catch {
      toast.error("Failed to load members");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!title || !projectId) {
      return toast.error("Title & Project are required");
    }

    try {
      setLoading(true);
      await api.post("/tasks", {
        title: title.trim(),
        description: description.trim(),
        projectId,
        assignedTo: assignedTo || null,
        priority,
      });

      toast.success("Task created 🚀");
      navigate("/admin/tasks");
    } catch (err) {
      toast.error(err.response?.data?.message || "Task creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5 font-heading">
          <CheckSquare className="text-emerald-400" size={24} /> Create New Task
        </h1>
        <p className="text-xs text-slate-400 mt-1">Add a new actionable item to a workspace.</p>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20">
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
              Task Title
            </label>
            <input
              type="text"
              placeholder="e.g. Update user authentication flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm resize-none"
              rows="3"
              placeholder="Provide additional details or requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
                Select Project
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  fetchMembers(e.target.value);
                }}
                required
                className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-xs"
              >
                <option value="" disabled>Choose a project...</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-xs"
              >
                <option value="low">🟢 Low</option>
                <option value="normal">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
              Assign Member (Optional)
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={!projectId}
              className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-xs disabled:opacity-50"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate("/admin/tasks")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 shadow-lg shadow-emerald-600/20"
              isLoading={loading}
              disabled={!title || !projectId}
            >
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
