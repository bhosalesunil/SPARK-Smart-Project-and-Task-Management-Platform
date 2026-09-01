import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, UserPlus, Trash2, ArrowLeft, Shield } from "lucide-react";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

export default function ProjectMembers() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, usersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get("/users"),
      ]);
      setProject(projRes.data);
      setAllUsers(usersRes.data);
    } catch {
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error("Please select a user");

    try {
      await api.post(`/projects/${projectId}/members`, { userId: selectedUserId });
      toast.success("Member added to team");
      setSelectedUserId("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      toast.success("Member removed from project");
      fetchData();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const availableUsers = allUsers.filter(
    (u) => !project?.members?.some((m) => m._id === u._id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft size={14} /> Back to Board
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5 font-heading">
          <Users className="text-emerald-400" size={24} /> {project?.name || "Project"} Team
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage collaborators and permissions for this workspace</p>
      </div>

      {/* Add Member Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
        <h2 className="text-sm font-bold text-white mb-3">Add Team Member</h2>
        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">Select a member to add...</option>
            {availableUsers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email}) - {u.role}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            size="sm"
            disabled={!selectedUserId}
            className="gap-1.5 px-5 shadow-lg shadow-emerald-600/20"
          >
            <UserPlus size={15} /> Add to Project
          </Button>
        </form>
      </div>

      {/* Members List */}
      <div className="bg-[#0f172a] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
        <div className="p-4 border-b border-slate-800/80">
          <h2 className="text-sm font-bold text-white">Current Members ({project?.members?.length || 0})</h2>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl bg-slate-800/50" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {project?.members?.map((m) => (
              <div
                key={m._id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#131d31] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {m.name ? m.name.charAt(0).toUpperCase() : "M"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{m.name}</h3>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {m.role || "Member"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{m.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveMember(m._id)}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Remove from project"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
