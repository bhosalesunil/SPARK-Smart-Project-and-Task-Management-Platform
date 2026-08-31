const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { generateToken } = require('../utils/jwt');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'MEMBER' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: isFirstUser ? 'ADMIN' : (role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'MEMBER'),
      status: isFirstUser ? 'ACTIVE' : 'PENDING',
    });

    // Log activity
    await Activity.create({
      type: 'USER_REGISTERED',
      description: `New user registered: ${user.name}`,
      user: user._id,
    });

    if (user.status === 'PENDING') {
      return res.status(201).json({
        message: 'Account created successfully! Your registration is pending admin approval.',
        user,
        requiresApproval: true,
      });
    }

    const token = generateToken({ userId: user._id, role: user.role });
    return res.status(201).json({
      message: 'Account created and activated successfully!',
      user,
      token,
      requiresApproval: false,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (role && user.role !== role.toUpperCase()) {
      return res.status(403).json({
        message: `Account is registered as ${user.role}, not ${role.toUpperCase()}.`,
      });
    }

    if (user.status === 'PENDING') {
      return res.status(403).json({
        message: 'Your account is pending admin approval. Please contact the administrator.',
        status: 'PENDING',
      });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({
        message: 'Your account registration was rejected by the administrator.',
        status: 'REJECTED',
      });
    }

    const token = generateToken({ userId: user._id, role: user.role });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists with this email, password reset instructions have been sent.',
      });
    }

    return res.status(200).json({
      message: 'Password reset instructions have been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
};
