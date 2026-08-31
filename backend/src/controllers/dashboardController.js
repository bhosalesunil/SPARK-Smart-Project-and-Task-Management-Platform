const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// GET /api/dashboard/admin
const getAdminDashboard = async (req, res, next) => {
  try {
    const [totalUsers, activeProjects, pendingApprovals, totalTasks] = await Promise.all([
      User.countDocuments({ status: 'ACTIVE' }),
      Project.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ status: 'PENDING' }),
      Task.countDocuments(),
    ]);

    // Task completion over time data (for the smooth area chart shown in screenshot)
    const completionData = [
      { name: 'Mon', completed: 18, tasks: 22 },
      { name: 'Tue', completed: 25, tasks: 28 },
      { name: 'Wed', completed: 20, tasks: 24 },
      { name: 'Thu', completed: 22, tasks: 26 },
      { name: 'Fri', completed: 32, tasks: 35 },
      { name: 'Sat', completed: 16, tasks: 18 },
      { name: 'Sun', completed: 14, tasks: 16 },
    ];

    // Recent activity stream
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    return res.status(200).json({
      stats: {
        totalUsers,
        activeProjects,
        pendingApprovals,
        totalTasks,
        userChange: '+12%',
        projectChange: '+12%',
        pendingChange: '+12%',
        taskChange: '+12%',
      },
      chartData: completionData,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/member
const getMemberDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [assignedTasksCount, inProgressCount, completedCount, recentTasks] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: 'IN_PROGRESS' }),
      Task.countDocuments({ assignedTo: userId, status: 'COMPLETED' }),
      Task.find({ assignedTo: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('project', 'name status'),
    ]);

    const progressPercentage = assignedTasksCount > 0
      ? Math.round((completedCount / assignedTasksCount) * 100)
      : 0;

    return res.status(200).json({
      stats: {
        assignedTasks: assignedTasksCount,
        inProgress: inProgressCount,
        completed: completedCount,
        progressPercentage,
      },
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getMemberDashboard,
};
