import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardOverview from './components/DashboardOverview';
import Users from './components/Users';
import Packages from './components/Packages';
import Orders from './components/Orders';
import Statistics from './components/Statistics';
import Products from './components/Products';
import { useSidebar } from './hooks/useSidebar';

function App() {
  const { isAuthenticated, user, loading, login, logout, loginError } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5E9DD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6F4E37] font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} error={loginError} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 font-['Poppins']">
        <Sidebar isCollapsed={isCollapsed} onLogout={logout} user={user} />

        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isCollapsed ? 'ml-16' : 'ml-60'
          } lg:${isCollapsed ? 'ml-16' : 'ml-60'} ml-16`}
        >
          <Topbar toggleSidebar={toggleSidebar} user={user} />

          <main className="flex-1 p-6 overflow-auto bg-[#F5E9DD]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/users" element={<Users />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/products" element={<Products />} />
              </Routes>
            </motion.div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;