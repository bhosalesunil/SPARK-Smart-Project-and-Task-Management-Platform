import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { UserPlus, Check, X, Shield, Clock } from "lucide-react";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

export default function AdminPending() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, projRes] = await Promise.all([
        api.get("/users/pending"),
        api.get("/projects"),
      ]);
      setPendingUsers(usersRes.data);
      setProjects(projRes.data);
    } catch {
      toast.error("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, role = "member", projectId = null) => {
    try {
      await api.put(`/users/${id}/approve`, { role, projectId });
      toast.success("User approved successfully 🚀");
      fetchData();
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject and remove this registration?")) return;
    try {
      await api.delete(`/users/${id}/reject`);
      toast.success("User registration rejected");
      fetchData();
    } catch {
      toast.error("Rejection failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight font-heading">
          Pending Approvals
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Review and authorize new user registrations</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">No pending approvals at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map((u) => (
            <div
              key={u._id}
              className="bg-[#0f172a] hover:bg-[#131d31] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-md shadow-black/20"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-300 shrink-0">
                  {u.name ? u.name.charAt(0).toUpperCase() : "P"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{u.name}</h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Requested: {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <Button
                  size="sm"
                  onClick={() => handleApprove(u._id, u.role)}
                  className="text-xs py-1.5 h-auto gap-1.5"
                >
                  <Check size={14} /> Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleReject(u._id)}
                  className="text-xs py-1.5 h-auto gap-1.5"
                >
                  <X size={14} /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
