const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role avatar')
      .sort({ createdAt: -1 });

    // Fetch task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const taskCount = await Task.countDocuments({ project: p._id });
        return {
          ...p.toJSON(),
          _count: {
            tasks: taskCount,
            members: p.members.length,
          },
        };
      })
    );

    return res.status(200).json({ projects: projectsWithCounts });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      project: {
        ...project.toJSON(),
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects (Admin only)
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, status = 'ACTIVE', memberIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      status: status.toUpperCase(),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: req.user.id,
      members: memberIds,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role avatar');

    // Log activity
    await Activity.create({
      type: 'PROJECT_CREATED',
      description: `Project '${project.name}' created by ${req.user.name}`,
      user: req.user.id,
    });

    return res.status(201).json({
      message: 'Project created successfully.',
      project: {
        ...populatedProject.toJSON(),
        _count: { tasks: 0, members: populatedProject.members.length },
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id (Admin only)
const updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { name, description, startDate, endDate, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (status) updateData.status = status.toUpperCase();
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const updatedProject = await Project.findByIdAndUpdate(projectId, updateData, { new: true })
      .populate('createdBy', 'name email')
      .populate('members', 'name email role avatar');

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const taskCount = await Task.countDocuments({ project: updatedProject._id });

    return res.status(200).json({
      message: 'Project updated successfully.',
      project: {
        ...updatedProject.toJSON(),
        _count: { tasks: taskCount, members: updatedProject.members.length },
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id (Admin only)
const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    await Task.deleteMany({ project: projectId });
    const deleted = await Project.findByIdAndDelete(projectId);

    if (!deleted) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    return res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:id/members (Admin only: update team membership)
const updateProjectMembers = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds)) {
      return res.status(400).json({ message: 'memberIds must be an array of user IDs.' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { members: memberIds },
      { new: true }
    ).populate('members', 'name email role avatar');

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    return res.status(200).json({
      message: 'Project team members updated successfully.',
      members: updatedProject.members,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectMembers,
};
