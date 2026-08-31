import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, Search, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/Button';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: { search, status: 'ACTIVE' },
      });
      setUsers(res.data.users || []);
      setTotalCount(res.data.totalCount || res.data.users?.length || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (user) => {
    const userId = user.id || user._id;
    if (window.confirm(`Promote ${user.name} (${user.email}) to Administrator?`)) {
      try {
        setPromotingId(userId);
        await api.patch(`/users/${userId}/role`, { role: 'ADMIN' });
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to promote user');
      } finally {
        setPromotingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage approved users and roles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full spark-input pl-10 pr-4 py-2 text-sm bg-[#121622]"
            />
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#121622] border border-[#1E2436] text-xs font-semibold text-slate-300 flex-shrink-0">
            {totalCount} Total
          </div>
        </div>
      </div>

      {/* Users List matching screenshot */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading users...
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-3">
          {users.map((u) => {
            const userId = u.id || u._id;
            const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
            const isAdmin = u.role === 'ADMIN';

            return (
              <div
                key={userId}
                className="bg-[#121622] border border-[#1E2436] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:border-slate-700/60"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1C2033] border border-[#2A314A] text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {u.name}
                      </h4>
                      <span className="spark-badge text-[10px] tracking-wider uppercase font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {u.email}
                    </p>
                  </div>
                </div>

                {/* Right: Promote button or Admin status */}
                <div>
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5 text-xs text-primary/80 font-medium px-3 py-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span>Admin Access</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePromote(u)}
                      disabled={promotingId === userId}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#0E111A] hover:bg-[#1C2033] border border-[#1E2436] hover:border-primary/40 px-3.5 py-1.5 rounded-lg transition-all"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>{promotingId === userId ? 'Promoting...' : 'Promote'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-12 text-center">
          <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-white mb-1">No Users Found</h3>
          <p className="text-xs text-slate-400">
            {search ? 'No users matching your query.' : 'There are no active users yet.'}
          </p>
        </div>
      )}
    </div>
  );
};
