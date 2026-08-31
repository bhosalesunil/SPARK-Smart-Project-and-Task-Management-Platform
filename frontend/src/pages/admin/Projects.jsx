import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, Search, Filter } from 'lucide-react';
import { projectService } from '../../services/projectService';
import api from '../../services/api';
import { ProjectCard } from '../../components/ProjectCard';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { useNavigate } from 'react-router-dom';

export const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form states
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'ACTIVE' });
  const [allMembers, setAllMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, [search, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects({
        search,
        status: statusFilter,
      });
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get('/users/members');
      setAllMembers(res.data.members || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectService.createProject(newProject);
      setIsCreateModalOpen(false);
      setNewProject({ name: '', description: '', status: 'ACTIVE' });
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create project');
    }
  };

  const openManageTeam = (project) => {
    setSelectedProject(project);
    const currentMemberIds = project.members
      ? project.members.map((m) => m.id || m._id || m.userId || m.user?.id || m.user?._id)
      : [];
    setSelectedMemberIds(currentMemberIds.filter(Boolean));
    setIsTeamModalOpen(true);
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveTeam = async () => {
    if (!selectedProject) return;
    try {
      await projectService.updateMembers(selectedProject.id || selectedProject._id, selectedMemberIds);
      setIsTeamModalOpen(false);
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update team members');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be removed.')) {
      try {
        await projectService.deleteProject(projectId);
        fetchProjects();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Active Projects</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor, manage and review all organizational projects.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary-hover"
        >
          Create Project
        </Button>
      </div>

      {/* Filter and Search Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
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
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading projects...
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id || project._id}
              project={project}
              onManageTeam={openManageTeam}
              onViewBoard={() => navigate('/admin/tasks')}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#121622] border border-[#1E2436] rounded-xl p-12 text-center">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-white mb-1">No Projects Found</h3>
          <p className="text-xs text-slate-400 mb-4">
            {search ? 'Try adjusting your search criteria.' : 'Create your first project to organize tasks.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            Create Project
          </Button>
        </div>
      )}

      {/* Modal: Create Project */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
              placeholder="e.g. Flipkart-Clone"
              className="w-full spark-input px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="E-commerce application development and cloud tracking..."
              className="w-full spark-input px-3.5 py-2 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Manage Team */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={`Manage Team - ${selectedProject?.name || 'Project'}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select members who have access to work on this project:
          </p>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {allMembers.map((member) => {
              const memId = member.id || member._id;
              const isSelected = selectedMemberIds.includes(memId);
              return (
                <div
                  key={memId}
                  onClick={() => toggleMemberSelection(memId)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 text-white'
                      : 'bg-[#0E111A] border-[#1E2436] text-slate-300 hover:bg-[#181E2E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{member.name}</div>
                      <div className="text-[11px] text-slate-500">{member.email}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded border-[#1E2436] bg-[#0E111A] text-primary focus:ring-0 pointer-events-none"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#1E2436]">
            <Button variant="outline" size="sm" onClick={() => setIsTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveTeam}>
              Save Team
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
