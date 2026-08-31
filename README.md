# SPARK – Smart Project and Task Management Platform

SPARK is a modern, high-performance web-based project and task management platform built for agile teams to organize projects, assign responsibilities, track task statuses, and monitor real-time productivity analytics with role-based access control.

---

## 📸 Key Features & Architecture

### 1. 🔐 Authentication & Role-Based Workflows
- **Dual-Role Sign In**: Instant switching between `Member` and `Admin` modes.
- **Admin Approval Gate**: New user registrations are automatically placed in a `PENDING` queue until an administrator approves them.
- **JWT Protection**: Secure API calls with bearer tokens and automatic token expiry handling.

### 2. 👨‍💼 Admin Management Suite
- **Interactive Dashboard**:
  - 4 Key metric cards (Total Users, Active Projects, Pending Approvals, Total Tasks).
  - Smooth task completion area velocity charts (7-day / 30-day view).
  - Live organization activity stream.
- **Active Projects**:
  - Create and manage projects with descriptions, timelines, and member counts.
  - Interactive "Manage Team" modal to assign/unassign team members.
- **Global Task Tracking**:
  - Create, edit, and assign tasks with priorities (`High`, `Medium`, `Low`) and due dates.
  - Real-time search and status filtering.
- **User Management**:
  - Directory of approved members and administrators.
  - One-click role promotion (`Member` ➔ `Admin`).
- **Pending Approvals Queue**:
  - Review incoming member registration requests with instant `Approve` / `Reject` actions.

### 3. 👨‍💻 Member Workspace
- **Personalized Dashboard**:
  - Assigned Tasks, In Progress, and Completed stat summary.
  - Circular progress ring chart showing task completion percentage.
  - Recent assigned tasks stream.
- **My Tasks**:
  - Dedicated member view filtered strictly to assigned work.
  - Interactive `UPDATE STATUS` dropdown to transition tasks: `To Do` ➔ `In Progress` ➔ `Completed`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router DOM, Axios |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs, CORS |
| **Database** | MongoDB (`mongodb://localhost:27017/spark`) |

---

## 🔑 Demo Credentials

| Role | Email | Password | Description |
|---|---|---|---|
| **Admin** | `admin@test.com` | `password123` | Full access (Demof) |
| **Member** | `mem1@test.com` | `password123` | Member with assigned tasks (Mem1) |
| **Member** | `mann@gmail.com` | `password123` | Active member |
| **Member** | `demo@gmail.com` | `password123` | Active member |

---

## 🚀 Getting Started

### 1. Database & Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds initial demo users, projects, tasks, and activities
npm start        # Starts Express API server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

### 3. API Endpoints Reference

#### Auth
- `POST /api/auth/register` - Create account (status: PENDING)
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Get current user profile

#### Users & Approvals (Admin)
- `GET /api/users` - List active users
- `PATCH /api/users/:id/role` - Promote/demote user
- `GET /api/approvals` - List pending user registrations
- `PATCH /api/approvals/:id/approve` - Approve user
- `PATCH /api/approvals/:id/reject` - Reject user

#### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Update team members

#### Tasks
- `GET /api/tasks` - List tasks (Admin: all, Member: assigned)
- `GET /api/tasks/my-tasks` - Member's assigned tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id/status` - Update task status (`TODO`, `IN_PROGRESS`, `COMPLETED`)
- `DELETE /api/tasks/:id` - Delete task

#### Dashboard Analytics
- `GET /api/dashboard/admin` - Admin stats, chart data, and activities
- `GET /api/dashboard/member` - Member stats, progress ring %, and recent tasks
