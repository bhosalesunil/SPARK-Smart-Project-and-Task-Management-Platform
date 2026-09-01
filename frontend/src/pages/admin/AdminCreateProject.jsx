import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Folder } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";

export default function AdminCreateProject() {
  const navigate = useNavigate();

  const [project, setProject] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!project.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/projects", {
        name: project.name.trim(),
        description: project.description.trim(),
        status: project.status,
      });

      toast.success("Project Created Successfully 🚀");
      navigate("/admin/projects");
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
      console.error("Create Project Error:", err);
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
          <Folder className="text-emerald-400" size={24} /> Create New Project
        </h1>
        <p className="text-xs text-slate-400 mt-1">Initialize a new workspace and Kanban board.</p>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g. Website Redesign"
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
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
              placeholder="What is this project about?"
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
              Status
            </label>
            <select
              className="w-full px-4 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
              value={project.status}
              onChange={(e) => setProject({ ...project, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate("/admin/projects")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 shadow-lg shadow-emerald-600/20"
              isLoading={loading}
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
