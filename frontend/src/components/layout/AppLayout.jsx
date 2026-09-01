import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, FolderKanban, CheckSquare, Users, UserPlus, 
  LogOut, Menu, Search, Bell, Moon, Sun, ChevronLeft, ChevronRight,
  ClipboardList, User, ShieldCheck
} from "lucide-react";
import useAuthStore from "../../context/AuthStore";
import SparkLogo from "../ui/SparkLogo";
import { cn } from "../../lib/utils";

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Projects", path: "/admin/projects", icon: FolderKanban },
    { name: "Boards", path: "/admin/projects", icon: ClipboardList },
    { name: "Tasks", path: "/admin/tasks", icon: CheckSquare },
    { name: "Members", path: "/admin/users", icon: Users },
    { name: "Pending Approvals", path: "/admin/pending", icon: UserPlus },
  ];

  const memberLinks = [
    { name: "Dashboard", path: "/member", icon: LayoutDashboard },
    { name: "Projects", path: "/admin/projects", icon: FolderKanban },
    { name: "My Tasks", path: "/member/tasks", icon: CheckSquare },
  ];

  const links = user?.role === "admin" ? adminLinks : memberLinks;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/member") return "Dashboard";
    if (path.startsWith("/admin/projects") || path.startsWith("/projects")) return "Projects";
    if (path.startsWith("/admin/tasks") || path.startsWith("/member/tasks")) return "Tasks";
    if (path.startsWith("/admin/users")) return "Members";
    if (path.startsWith("/admin/pending")) return "Pending Approvals";
    if (path.startsWith("/admin/create-project")) return "Create Project";
    if (path.startsWith("/admin/create-task")) return "Create Task";
    return "Dashboard";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0b101b] border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
        <div 
          onClick={() => navigate(user?.role === "admin" ? "/admin" : "/member")}
          className="cursor-pointer"
        >
          <SparkLogo size="sm" showSubtitle={false} />
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.name + link.path}
            to={link.path}
            end={link.path === "/admin" || link.path === "/member"}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative font-medium text-sm",
              isActive 
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            {({ isActive }) => (
              <>
                <link.icon 
                  size={19} 
                  className={cn(
                    "shrink-0 transition-colors", 
                    isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                  )} 
                />
                {!isCollapsed && <span className="whitespace-nowrap">{link.name}</span>}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-xs font-medium text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                    {link.name}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Logout button at bottom of sidebar */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors group",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut size={18} className="shrink-0 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#080c14] text-slate-100 selection:bg-emerald-500/30">
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? "80px" : "240px" }}
        className="hidden md:block sticky top-0 h-screen shrink-0 z-40 transition-all duration-300 ease-in-out"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed inset-y-0 left-0 w-[240px] z-50 md:hidden bg-[#0b101b]"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 sticky top-0 z-30 bg-[#080c14]/90 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              <Menu size={20} />
            </button>

            <h1 className="text-xl font-bold text-white tracking-tight font-heading">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Theme Toggle Icon (Mockup feature) */}
            <button 
              title="Toggle theme" 
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <Moon size={18} />
            </button>

            {/* Notification Bell */}
            <button 
              title="Notifications" 
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/50 transition-colors relative"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-1">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300 shadow-inner">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight">
                  {user?.name || "User"}
                </span>
                <span className="text-[11px] font-medium text-emerald-400 capitalize">
                  {user?.role || "Member"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-5 sm:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
