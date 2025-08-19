import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart, 
  LogOut,
  Coffee
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

const menuItems = [
  { icon: Home, label: 'Tổng quan', path: '/' },
  { icon: Users, label: 'Quản lý người dùng', path: '/users' },
  { icon: Package, label: 'Quản lý gói dịch vụ', path: '/packages' },
  { icon: ShoppingCart, label: 'Đơn hàng', path: '/orders' },
  { icon: BarChart, label: 'Thống kê', path: '/statistics' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <motion.div 
      className="fixed left-0 top-0 h-full bg-[#6F4E37] text-white z-50 shadow-xl"
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-[#5A3E2D] cursor-pointer"
             onClick={() => navigate('/')}>
          <Coffee className="w-8 h-8 text-[#FFD580]" />
          {!isCollapsed && (
            <motion.span 
              className="ml-3 text-lg font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              CafeDaily
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 group hover:bg-[#5A3E2D] hover:text-[#DCC1A1] ${
                  isActive 
                    ? 'bg-[#5A3E2D] border-l-4 border-[#FFD580] text-[#FFD580]' 
                    : 'text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <motion.span 
                  className="ml-3 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-[#5A3E2D] p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-3 rounded-lg transition-all duration-200 hover:bg-[#5A3E2D] hover:text-[#DCC1A1] text-white group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <motion.span 
                className="ml-3 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Đăng xuất
              </motion.span>
            )}
          </button>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <motion.div 
            className="p-4 text-center text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            © 2025 CafeDaily
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;