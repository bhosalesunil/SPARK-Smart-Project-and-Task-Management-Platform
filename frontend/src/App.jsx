import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProjects } from './pages/admin/Projects';
import { AdminTasks } from './pages/admin/Tasks';
import { AdminUsers } from './pages/admin/Users';
import { AdminApprovals } from './pages/admin/Approvals';

// Member Pages
import { MemberDashboard } from './pages/member/Dashboard';
import { MyTasks } from './pages/member/MyTasks';

// Layout wrapper for authenticated dashboard views
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all duration-200">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Root Redirect Component
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/member'} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/pending" element={<AdminApprovals />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
          </Route>
        </Route>

        {/* Protected Member Routes */}
        <Route element={<ProtectedRoute requiredRole="MEMBER" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/member" element={<MemberDashboard />} />
            <Route path="/member/tasks" element={<MyTasks />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
