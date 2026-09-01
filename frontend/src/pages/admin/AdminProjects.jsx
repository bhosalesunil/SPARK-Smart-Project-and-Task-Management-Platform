import { motion, AnimatePresence } from "framer-motion";
import { Folder, Smartphone, Rocket, Briefcase, Camera, Wrench, Plus, Search, Trash2, ArrowRight, Users, Layout } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import useAuthStore from "../../context/AuthStore";

export default function AdminProjects() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const projectIcons = [
    { icon: Folder, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { icon: Smartphone, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { icon: Rocket, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { icon: Briefcase, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { icon: Camera, color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { icon: Wrench, color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let result = projects;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    setFilteredProjects(result);
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      toast.error("Failed to load projects");
      console.error("Projects Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Projects
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage workspaces and Kanban boards</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {user?.role === "admin" && (
            <Button
              onClick={() => navigate("/admin/create-project")}
              className="gap-1.5 text-xs py-2 px-4 shadow-lg shadow-emerald-600/20 shrink-0"
            >
              <Plus size={15} /> New Project
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">No projects found.</p>
          {user?.role === "admin" && (
            <Button
              onClick={() => navigate("/admin/create-project")}
              className="mt-4 text-xs"
            >
              Create First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project, idx) => {
            const iconConfig = projectIcons[idx % projectIcons.length];
            const IconComponent = iconConfig.icon;

            return (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-[#0f172a] hover:bg-[#131d31] border border-slate-800/90 hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-lg shadow-black/20"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${iconConfig.color}`}>
                      <IconComponent size={20} />
                    </div>

                    {user?.role === "admin" && (
                      <button
                        onClick={(e) => deleteProject(project._id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Project"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  
                  {project.description ? (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">
                      3 Boards • {project.members?.length || 1} Members
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users size={14} className="text-slate-500" /> {project.members?.length || 1} Members
                  </span>

                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform font-semibold flex items-center gap-1">
                    View Board <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
