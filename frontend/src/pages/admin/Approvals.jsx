import React, { useState, useEffect } from 'react';
import { UserCheck, Check, X, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/Button';

export const AdminApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/approvals');
      setPendingUsers(res.data.pendingUsers || []);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setProcessingId(userId);
      await api.patch(`/approvals/${userId}/approve`);
      setPendingUsers((prev) => prev.filter((u) => (u.id || u._id) !== userId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject this registration request?')) {
      try {
        setProcessingId(userId);
        await api.patch(`/approvals/${userId}/reject`);
        setPendingUsers((prev) => prev.filter((u) => (u.id || u._id) !== userId));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject user');
      } finally {
        setProcessingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pending Approvals</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and manage new user registrations
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          {pendingUsers.length} Pending
        </div>
      </div>

      {/* Pending User Cards matching screenshot */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading pending requests...
        </div>
      ) : pendingUsers.length > 0 ? (
        <div className="space-y-3">
          {pendingUsers.map((u) => {
            const userId = u.id || u._id;
            const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
            const joinedDate = u.createdAt
              ? new Date(u.createdAt).toLocaleDateString()
              : '6/7/2026';

            return (
              <div
                key={userId}
                className="bg-[#121622] border border-[#1E2436] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700/60"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1C2033] border border-[#2A314A] text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {u.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <span className="truncate">{u.email}</span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>Joined {joinedDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={X}
                    disabled={processingId === userId}
                    onClick={() => handleReject(userId)}
                    className="text-xs"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Check}
                    disabled={processingId === userId}
                    onClick={() => handleApprove(userId)}
                    className="text-xs bg-primary hover:bg-primary-hover"
                  >
                    {processingId === userId ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-12 text-center">
          <UserCheck className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
          <h3 className="text-base font-medium text-white mb-1">All Caught Up!</h3>
          <p className="text-xs text-slate-400">
            There are no pending user approvals at this time.
          </p>
        </div>
      )}
    </div>
  );
};
