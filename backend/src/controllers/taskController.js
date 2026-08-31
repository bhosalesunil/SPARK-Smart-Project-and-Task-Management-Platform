const Task = require('../models/Task');
const Activity = require('../models/Activity');

// GET /api/tasks (Admin sees all, Member sees assigned)
const getTasks = async (req, res, next) => {
  try {
    const { search, status, priority, projectId, assignedToId } = req.query;
    const query = {};

    if (req.user.role !== 'ADMIN') {
      query.assignedTo = req.user.id;
    } else if (assignedToId) {
      query.assignedTo = assignedToId;
    }

    if (status && status !== 'ALL') {
      const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
      query.status = normalizedStatus;
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority.toUpperCase();
    }

    if (projectId) {
      query.project = projectId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/my-tasks (Dedicated member endpoint)
const getMyTasks = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {
      assignedTo: req.user.id,
    };

    if (status && status !== 'ALL') {
      const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
      query.status = normalizedStatus;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId)
      .populate('project')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks (Admin only or authorized)
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedToId, priority = 'MEDIUM', dueDate, status = 'TODO' } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project are required.' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      project: projectId,
      assignedTo: assignedToId || null,
      createdBy: req.user.id,
      priority: priority.toUpperCase(),
      status: status.toUpperCase().replace(/\s+/g, '_'),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email role');

    // Log activity
    await Activity.create({
      type: 'TASK_CREATED',
      description: `Task '${task.title}' created in ${populatedTask.project?.name || 'Project'}`,
      user: req.user.id,
    });

    return res.status(201).json({
      message: 'Task created successfully.',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:id/status (Member can update assigned task, Admin can update any)
const updateTaskStatus = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
    if (!['TODO', 'IN_PROGRESS', 'COMPLETED'].includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid status. Must be TODO, IN_PROGRESS, or COMPLETED.' });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Check authorization: Admin can update any task; Member can only update assigned tasks
    if (req.user.role !== 'ADMIN' && (!task.assignedTo || task.assignedTo.toString() !== req.user.id.toString())) {
      return res.status(403).json({ message: 'You are only allowed to update tasks assigned to you.' });
    }

    task.status = normalizedStatus;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email');

    // Log activity
    let activityDesc = `Task '${populatedTask.title}' updated to ${normalizedStatus}`;
    if (normalizedStatus === 'COMPLETED') {
      activityDesc = `Task '${populatedTask.title}' marked completed by ${req.user.name}`;
    }

    await Activity.create({
      type: normalizedStatus === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
      description: activityDesc,
      user: req.user.id,
    });

    return res.status(200).json({
      message: 'Task status updated successfully.',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id (Admin only)
const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { title, description, projectId, assignedToId, priority, dueDate, status } = req.body;

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (projectId) updateData.project = projectId;
    if (assignedToId !== undefined) updateData.assignedTo = assignedToId || null;
    if (priority) updateData.priority = priority.toUpperCase();
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (status) updateData.status = status.toUpperCase().replace(/\s+/g, '_');

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true })
      .populate('project', 'name status')
      .populate('assignedTo', 'name email');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id (Admin only)
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const deleted = await Task.findByIdAndDelete(taskId);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
