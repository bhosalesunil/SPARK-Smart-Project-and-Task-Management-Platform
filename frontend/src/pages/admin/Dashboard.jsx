import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FolderGit2, 
  Clock, 
  CheckSquare, 
  Plus, 
  TrendingUp, 
  Activity as ActivityIcon 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 15,
    activeProjects: 1,
    pendingApprovals: 3,
    totalTasks: 1,
    userChange: '+12%',
    projectChange: '+12%',
    pendingChange: '+12%',
    taskChange: '+12%',
  });
  const [chartData, setChartData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Form states
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedToId: '',
    priority: 'MEDIUM',
  });
  const [projectsList, setProjectsList] = useState([]);
  const [membersList, setMembersList] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      setStats(res.data.stats);
      setChartData(res.data.chartData);
      setActivities(res.data.activities);

      // Fetch projects & members for dropdowns in modals
      const [projRes, memRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users/members'),
      ]);
      setProjectsList(projRes.data.projects || []);
      setMembersList(memRes.data.members || []);
      if (projRes.data.projects?.length > 0) {
        setNewTask((prev) => ({ ...prev, projectId: projRes.data.projects[0].id || projRes.data.projects[0]._id }));
      }
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setIsProjectModalOpen(false);
      setNewProject({ name: '', description: '' });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      setIsTaskModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        projectId: projectsList[0]?.id || projectsList[0]?._id || '',
        assignedToId: '',
        priority: 'MEDIUM',
      });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Greeting with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || 'Demof'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's what's happening in your workspace today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => setIsProjectModalOpen(true)}
            className="text-xs sm:text-sm"
          >
            New Project
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsTaskModalOpen(true)}
            className="text-xs sm:text-sm bg-gradient-to-r from-primary to-accent-purple"
          >
            New Task
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Users */}
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {stats.userChange || '+12%'}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Total Users
            </span>
            <span className="text-2xl font-bold text-white">
              {stats.totalUsers}
            </span>
          </div>
        </div>

        {/* Card 2: Active Projects */}
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {stats.projectChange || '+12%'}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Active Projects
            </span>
            <span className="text-2xl font-bold text-white">
              {stats.activeProjects}
            </span>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {stats.pendingChange || '+12%'}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Pending Approvals
            </span>
            <span className="text-2xl font-bold text-white">
              {stats.pendingApprovals}
            </span>
          </div>
        </div>

        {/* Card 4: Total Tasks */}
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {stats.taskChange || '+12%'}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Total Tasks
            </span>
            <span className="text-2xl font-bold text-white">
              {stats.totalTasks}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Graph & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Completion Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#121622] border border-[#1E2436] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Task Completion</h3>
              <p className="text-xs text-slate-400 mt-0.5">Velocity and completion metrics over time</p>
            </div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-[#0E111A] border border-[#1E2436] text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E111A',
                    borderColor: '#1E2436',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#purpleGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List (1 Col) */}
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ActivityIcon className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-white">Recent Activity</h3>
            </div>

            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((act, index) => (
                  <div key={act.id || act._id || index} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 ring-4 ring-primary/10"></div>
                    <div className="flex-1">
                      <p className="text-slate-200 font-medium">{act.description}</p>
                      <span className="text-[11px] text-slate-500">
                        {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No recent activities recorded.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E2436]/60 text-center">
            <span className="text-xs text-slate-500">Live activity synced with database</span>
          </div>
        </div>
      </div>

      {/* Modal: New Project */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Project Name</label>
            <input
              type="text"
              required
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="e.g. Mobile App Redesign"
              className="w-full spark-input px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Provide context and goals..."
              className="w-full spark-input px-3.5 py-2 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Task */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Task Title</label>
            <input
              type="text"
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g. Set up CI/CD pipeline"
              className="w-full spark-input px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Project</label>
            <select
              required
              value={newTask.projectId}
              onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
              className="w-full spark-input px-3.5 py-2 text-sm"
            >
              {projectsList.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Assign To Member</label>
            <select
              value={newTask.assignedToId}
              onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
              className="w-full spark-input px-3.5 py-2 text-sm"
            >
              <option value="">Unassigned</option>
              {membersList.map((m) => (
                <option key={m.id || m._id} value={m.id || m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full spark-input px-3.5 py-2 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Task instructions and expectations..."
              className="w-full spark-input px-3.5 py-2 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
