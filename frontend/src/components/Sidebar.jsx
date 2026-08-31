import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderGit2, 
  CheckSquare, 
  Users, 
  UserCheck, 
  ChevronLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Projects', path: '/admin/projects', icon: FolderGit2 },
    { label: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Pending Approvals', path: '/admin/pending', icon: UserCheck },
  ];

  const memberNavItems = [
    { label: 'Dashboard', path: '/member', icon: LayoutDashboard },
    { label: 'My Tasks', path: '/member/tasks', icon: CheckSquare },
  ];

  const navItems = isAdmin ? adminNavItems : memberNavItems;

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0E111A] border-r border-[#1E2436] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#1E2436]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-md shadow-primary/30 text-base">
                S
              </div>
              <span className="font-bold text-lg text-white tracking-wider">SPARK</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 lg:block p-1 rounded-md"
              title="Toggle Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/member'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1C2033] text-primary border border-primary/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#151926]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Pill */}
        <div className="p-4 border-t border-[#1E2436]">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-[#121622]/60 border border-[#1E2436]/60">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-semibold text-primary text-sm flex-shrink-0">
              {initial}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-white truncate leading-tight">
                {user?.name || 'User'}
              </span>
              <span className="text-xs text-slate-400 capitalize">
                {user?.role ? user.role.toLowerCase() : 'member'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
