const User = require('../models/User');
const Activity = require('../models/Activity');

// GET /api/approvals (Admin only)
const getPendingApprovals = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({ status: 'PENDING' })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      pendingUsers,
      count: pendingUsers.length,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/approvals/:id/approve (Admin only)
const approveUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: 'ACTIVE' },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Log activity
    await Activity.create({
      type: 'USER_APPROVED',
      description: `Admin approved user: ${updatedUser.name} (${updatedUser.email})`,
      user: req.user.id,
    });

    return res.status(200).json({
      message: `User ${updatedUser.name} approved successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/approvals/:id/reject (Admin only)
const rejectUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: 'REJECTED' },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Log activity
    await Activity.create({
      type: 'USER_REJECTED',
      description: `Admin rejected user registration: ${updatedUser.name}`,
      user: req.user.id,
    });

    return res.status(200).json({
      message: `User registration rejected.`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingApprovals,
  approveUser,
  rejectUser,
};
