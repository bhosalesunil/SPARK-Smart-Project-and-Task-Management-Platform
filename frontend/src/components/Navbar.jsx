import React from 'react';
import { Search, Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onMenuClick, searchValue = '', onSearchChange }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-[#1E2436] bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2436]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full bg-[#121622] border border-[#1E2436] focus:border-primary text-sm rounded-lg pl-10 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#121622] transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-[#0B0E14]"></span>
        </button>

        {/* Logout Button matching screenshot */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#121622] transition-colors font-medium"
        >
          <LogOut className="w-4 h-4 rotate-180" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
