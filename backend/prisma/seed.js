const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SPARK database...');

  // Clean existing tables
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Demof',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 2. Create Key Members from screenshots
  const mem1 = await prisma.user.create({
    data: {
      name: 'Mem1',
      email: 'mem1@test.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  });

  const mann = await prisma.user.create({
    data: {
      name: 'Mann',
      email: 'mann@gmail.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  });

  const demo = await prisma.user.create({
    data: {
      name: 'Demo',
      email: 'demo@gmail.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  });

  const demo2 = await prisma.user.create({
    data: {
      name: 'Demo',
      email: 'demo2@gmail.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  });

  const testMember1 = await prisma.user.create({
    data: {
      name: 'Test Member',
      email: 'member_1780814068831@test.com',
      password: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  });

  const testAdmin = await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: 'admin_1780814068831@test.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
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
    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        status: 'ACTIVE',
      },
    });
  }

  // 3. Create Pending Approvals (3 Pending from screenshot)
  const pendingUsers = [
    { name: 'Test User', email: 'test@example.com' },
    { name: 'Test Member', email: 'member_1780813938543@test.com' },
    { name: 'Test Member', email: 'member_1780813959819@test.com' },
  ];

  for (const p of pendingUsers) {
    await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        password: hashedPassword,
        role: 'MEMBER',
        status: 'PENDING',
      },
    });
  }

  // 4. Create Project "Flipkart-Clone"
  const project = await prisma.project.create({
    data: {
      name: 'Flipkart-Clone',
      description: 'E-commerce application development and cloud tracking dashboard.',
      status: 'ACTIVE',
      createdById: admin.id,
      startDate: new Date('2026-06-07'),
      members: {
        create: [
          { userId: mem1.id },
          { userId: mann.id },
          { userId: demo.id },
        ],
      },
    },
  });

  // 5. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Create a git hub repo',
      description: 'Set up initial project repository with branch protection and templates.',
      projectId: project.id,
      assignedToId: mem1.id,
      createdById: admin.id,
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 6. Create Activities matching screenshots
  const activities = [
    { type: 'USER_REGISTERED', description: 'New user registered: John Doe', userId: admin.id, createdAt: new Date(Date.now() - 2 * 60 * 1000) },
    { type: 'PROJECT_CREATED', description: "Project 'Alpha' created by Sarah", userId: admin.id, createdAt: new Date(Date.now() - 60 * 60 * 1000) },
    { type: 'TASK_COMPLETED', description: "Task 'Fix UI bugs' marked completed", userId: admin.id, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { type: 'TASK_CREATED', description: "Task 'Create a git hub repo' assigned to Mem1", userId: admin.id, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
  ];

  for (const act of activities) {
    await prisma.activity.create({
      data: act,
    });
  }

  console.log('SPARK Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
