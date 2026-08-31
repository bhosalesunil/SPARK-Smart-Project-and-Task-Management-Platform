import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Folder, 
  Play 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';

export const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    assignedTasks: 1,
    inProgress: 0,
    completed: 0,
    progressPercentage: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberDashboard();
  }, []);

  const fetchMemberDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/member');
      setStats(res.data.stats || {
        assignedTasks: 0,
        inProgress: 0,
        completed: 0,
        progressPercentage: 0,
      });
      setRecentTasks(res.data.recentTasks || []);
    } catch (error) {
      console.error('Failed to load member dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ring chart data
  const chartData = [
    { name: 'Completed', value: stats.completed || 0, color: '#3B82F6' },
    { name: 'Remaining', value: Math.max(1, (stats.assignedTasks || 1) - (stats.completed || 0)), color: '#1E2436' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Greeting Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Hello, {user?.name || 'Mem1'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ready to crush your goals today? Here's an overview of your work.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/member/tasks')}
          className="bg-primary hover:bg-primary-hover self-start sm:self-auto"
        >
          View My Tasks
        </Button>
      </div>

      {/* 3 Stat Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Assigned Tasks */}
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-5 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Assigned Tasks
            </span>
            <span className="text-2xl font-bold text-white">
              {stats.assignedTasks}
            </span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-5 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              In Progress
            </span>
            <span className="text-2xl font-bold text-white">
              {stats.inProgress}
            </span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-5 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Completed
            </span>
            <span className="text-2xl font-bold text-white">
              {stats.completed}
            </span>
          </div>
        </div>
      </div>

      {/* Task Progress Ring & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular Ring Chart (1 Col) */}
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-full text-left mb-2">
            <h3 className="text-base font-semibold text-white">Task Progress</h3>
          </div>

          <div className="relative w-44 h-44 my-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {stats.progressPercentage}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Completed
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            {stats.completed} of {stats.assignedTasks} assigned tasks completed
          </p>
        </div>

        {/* Recent Tasks (2 Cols) */}
        <div className="lg:col-span-2 bg-[#121622] border border-[#1E2436] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">Recent Tasks</h3>
              <Link
                to="/member/tasks"
                className="text-xs text-primary hover:text-primary-light flex items-center gap-1 font-medium transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentTasks.length > 0 ? (
                recentTasks.map((t) => (
                  <div
                    key={t.id || t._id}
                    onClick={() => navigate('/member/tasks')}
                    className="p-4 rounded-xl bg-[#0E111A] border border-[#1E2436] hover:border-primary/40 flex items-center justify-between gap-4 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="spark-badge text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                        {t.status === 'TODO' ? 'To Do' : t.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                          {t.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Folder className="w-3 h-3 text-slate-500" />
                          <span>{t.project?.name || 'Project'}</span>
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No assigned tasks at the moment.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E2436]/60 text-center">
            <span className="text-xs text-slate-500">Update task status directly in My Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
