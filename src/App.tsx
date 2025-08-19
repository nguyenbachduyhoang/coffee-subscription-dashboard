import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardOverview from './components/DashboardOverview';
import Users from './components/Users';
import Packages from './components/Packages';
import Orders from './components/Orders';
import Statistics from './components/Statistics';
import { useSidebar } from './hooks/useSidebar';

function App() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 font-['Poppins']">
        <Sidebar isCollapsed={isCollapsed} />
        
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isCollapsed ? 'ml-16' : 'ml-60'
          } lg:${isCollapsed ? 'ml-16' : 'ml-60'} ml-16`}
        >
          <Topbar toggleSidebar={toggleSidebar} />
          
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
              </Routes>
            </motion.div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;