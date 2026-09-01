import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Users, Search, Shield, Trash2, CheckCircle2, UserCheck, ShieldAlert } from "lucide-react";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    setFilteredUsers(result);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (id) => {
    if (!window.confirm("Promote this user to Admin?")) return;
    try {
      await api.put(`/users/${id}/promote-admin`);
      toast.success("User promoted to Admin 🛡️");
      fetchUsers();
    } catch {
      toast.error("Failed to promote user");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      await api.delete(`/users/${id}/reject`);
      toast.success("User removed");
      fetchUsers();
    } catch {
      toast.error("Failed to remove user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Team Members
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage user roles, authorizations, and memberships</p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">No members found.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
          <div className="divide-y divide-slate-800/80">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#131d31] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-white">
                    {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{u.name}</h3>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                          u.role === "admin"
                            ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {u.role !== "admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromote(u._id)}
                      className="text-xs py-1.5 h-auto gap-1"
                    >
                      <Shield size={13} /> Make Admin
                    </Button>
                  )}

                  <button
                    onClick={() => handleRemove(u._id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Remove user"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
