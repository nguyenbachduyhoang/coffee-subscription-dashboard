import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-[#6F4E37] border-b border-[#5A3E2D] flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[#5A3E2D] transition-colors duration-200 text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-white">Admin Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg hover:bg-[#5A3E2D] transition-colors duration-200 text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-2 text-white">
          <div className="w-8 h-8 bg-[#FFD580] rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-[#6F4E37]" />
          </div>
          <span className="hidden md:block font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;