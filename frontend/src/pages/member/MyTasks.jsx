import React, { useState, useEffect } from 'react';
import { CheckSquare, Search } from 'lucide-react';
import { taskService } from '../../services/taskService';
import { TaskCard } from '../../components/TaskCard';

export const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, [search, statusFilter]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getMyTasks({
        search,
        status: statusFilter,
      });
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch assigned tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      fetchMyTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update task status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header matching screenshot */}
      <div>
        <div className="flex items-center gap-2.5">
          <CheckSquare className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-white tracking-tight">My Tasks</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage and update the status of tasks assigned to you.
        </p>
      </div>

      {/* Search and Status filter bar matching screenshot */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search my tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full spark-input pl-10 pr-4 py-2 text-sm bg-[#121622]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full spark-input px-3.5 py-2 text-xs bg-[#121622] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List matching screenshot */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading your tasks...
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id || task._id}
              task={task}
              isMemberView={true}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-white mb-1">No Tasks Assigned</h3>
          <p className="text-xs text-slate-400">
            {search ? 'No tasks match your search filter.' : 'You have no assigned tasks currently.'}
          </p>
        </div>
      )}
    </div>
  );
};
