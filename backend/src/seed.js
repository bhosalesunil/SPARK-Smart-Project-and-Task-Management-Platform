require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Activity = require('./models/Activity');

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spark';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear old data
    await Activity.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    const admin = await User.create({
      name: 'Demof',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    // 2. Create Members matching screenshots
    const mem1 = await User.create({
      name: 'Mem1',
      email: 'mem1@test.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const mann = await User.create({
      name: 'Mann',
      email: 'mann@gmail.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const demo = await User.create({
      name: 'Demo',
      email: 'demo@gmail.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const demo2 = await User.create({
      name: 'Demo',
      email: 'demo2@gmail.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const testMember1 = await User.create({
      name: 'Test Member',
      email: 'member_1780814068831@test.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const testAdmin = await User.create({
      name: 'Test Admin',
      email: 'admin_1780814068831@test.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    // Additional active users to match 15 total users
    const additionalUsers = [
      { name: 'John Doe', email: 'john@example.com', role: 'MEMBER' },
      { name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'MEMBER' },
      { name: 'Alex Rivera', email: 'alex@example.com', role: 'MEMBER' },
      { name: 'Elena Rostova', email: 'elena@example.com', role: 'MEMBER' },
      { name: 'David Kim', email: 'david@example.com', role: 'MEMBER' },
      { name: 'Priya Patel', email: 'priya@example.com', role: 'MEMBER' },
      { name: 'Carlos Gomez', email: 'carlos@example.com', role: 'MEMBER' },
      { name: 'Aisha Khan', email: 'aisha@example.com', role: 'MEMBER' },
    ];

    for (const u of additionalUsers) {
      await User.create({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        status: 'ACTIVE',
      });
    }

    // 3. Create Pending Approvals (3 Pending from screenshot)
    const pendingUsers = [
      { name: 'Test User', email: 'test@example.com' },
      { name: 'Test Member', email: 'member_1780813938543@test.com' },
      { name: 'Test Member', email: 'member_1780813959819@test.com' },
    ];

    for (const p of pendingUsers) {
      await User.create({
        name: p.name,
        email: p.email,
        password: hashedPassword,
        role: 'MEMBER',
        status: 'PENDING',
      });
    }

    // 4. Create Project "Flipkart-Clone"
    const project = await Project.create({
      name: 'Flipkart-Clone',
      description: 'E-commerce application development and cloud tracking dashboard.',
      status: 'ACTIVE',
      createdBy: admin._id,
      startDate: new Date('2026-06-07'),
      members: [mem1._id, mann._id, demo._id],
    });

    // 5. Create Task
    const task1 = await Task.create({
      title: 'Create a git hub repo',
      description: 'Set up initial project repository with branch protection and templates.',
      project: project._id,
      assignedTo: mem1._id,
      createdBy: admin._id,
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 6. Create Activities matching screenshots
    const activities = [
      { type: 'USER_REGISTERED', description: 'New user registered: John Doe', user: admin._id, createdAt: new Date(Date.now() - 2 * 60 * 1000) },
      { type: 'PROJECT_CREATED', description: "Project 'Alpha' created by Sarah", user: admin._id, createdAt: new Date(Date.now() - 60 * 60 * 1000) },
      { type: 'TASK_COMPLETED', description: "Task 'Fix UI bugs' marked completed", user: admin._id, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { type: 'TASK_CREATED', description: "Task 'Create a git hub repo' assigned to Mem1", user: admin._id, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    ];

    for (const act of activities) {
      await Activity.create(act);
    }

    console.log('SPARK Database successfully populated with initial seed data!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
