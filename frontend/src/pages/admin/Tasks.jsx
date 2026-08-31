import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search } from 'lucide-react';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import api from '../../services/api';
import { TaskCard } from '../../components/TaskCard';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';

export const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedToId: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter]);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks({
        search,
        status: statusFilter,
      });
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [projRes, memRes] = await Promise.all([
        projectService.getProjects(),
        api.get('/users/members'),
      ]);
      const projects = projRes.projects || [];
      setProjectsList(projects);
      setMembersList(memRes.data.members || []);
      if (projects.length > 0) {
        setNewTask((prev) => ({ ...prev, projectId: projects[0].id || projects[0]._id }));
      }
    } catch (error) {
      console.error('Failed to load dropdown items:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.createTask(newTask);
      setIsCreateModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        projectId: projectsList[0]?.id || projectsList[0]?._id || '',
        assignedToId: '',
        priority: 'MEDIUM',
        dueDate: '',
      });
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchTasks();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-white tracking-tight">All Tasks</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage and track organizational tasks globally.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary-hover"
        >
          Create Task
        </Button>
      </div>

      {/* Filter and Search Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
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

      {/* Task Cards List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading tasks...
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id || task._id}
              task={task}
              isMemberView={false}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-white mb-1">No Tasks Found</h3>
          <p className="text-xs text-slate-400 mb-4">
            {search ? 'Try adjusting your search criteria.' : 'Create tasks to assign work to members.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            Create Task
          </Button>
        </div>
      )}

      {/* Modal: Create Task */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
              placeholder="e.g. Create a git hub repo"
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
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full spark-input px-3.5 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Task instructions and guidelines..."
              className="w-full spark-input px-3.5 py-2 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
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
