const User = require('../models/User');
const Activity = require('../models/Activity');

// GET /api/users (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status = 'ACTIVE' } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (role && role !== 'ALL') {
      query.role = role.toUpperCase();
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    const totalCount = await User.countDocuments({ status: 'ACTIVE' });

    return res.status(200).json({
      users,
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/role (Admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!['ADMIN', 'MEMBER'].includes(role?.toUpperCase())) {
      return res.status(400).json({ message: 'Valid role (ADMIN or MEMBER) is required.' });
    }

    // Prevent demoting self if only admin
    if (req.user.id.toString() === userId.toString() && role.toUpperCase() !== 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN', status: 'ACTIVE' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot demote the only active Administrator.' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: role.toUpperCase() },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Log activity
    await Activity.create({
      type: 'USER_PROMOTED',
      description: `User ${updatedUser.name} role updated to ${updatedUser.role}`,
      user: req.user.id,
    });

    return res.status(200).json({
      message: `User role successfully updated to ${updatedUser.role}`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/members (For assigning to projects and tasks)
const getAvailableMembers = async (req, res, next) => {
  try {
    const members = await User.find({ status: 'ACTIVE' })
      .select('name email role avatar')
      .sort({ name: 1 });

    return res.status(200).json({ members });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  getAvailableMembers,
};
