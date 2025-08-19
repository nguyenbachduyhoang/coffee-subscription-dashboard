import React from 'react';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getDemoData } from '../utils/demoData';

const DashboardOverview: React.FC = () => {
  const { users, packages, orders } = getDemoData();
  
  const revenueData = [
    { month: 'T1', revenue: 45000000 },
    { month: 'T2', revenue: 52000000 },
    { month: 'T3', revenue: 48000000 },
    { month: 'T4', revenue: 61000000 },
    { month: 'T5', revenue: 55000000 },
    { month: 'T6', revenue: 67000000 },
  ];

  const packageSalesData = [
    { name: 'Gói 150K', sales: 120 },
    { name: 'Gói 300K', sales: 98 },
    { month: 'Gói 450K', sales: 76 },
    { name: 'Gói 600K', sales: 54 },
  ];

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const stats = [
    {
      title: 'Tổng người dùng',
      value: users.length.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Gói dịch vụ',
      value: packages.length.toLocaleString(),
      icon: Package,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Đơn hàng tháng',
      value: orders.length.toLocaleString(),
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Doanh thu tháng',
      value: `${(totalRevenue / 1000000).toFixed(1)}M VNĐ`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600'
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-[#6F4E37] mb-6">Tổng quan Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#6F4E37] mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-[#6F4E37] mb-4">Doanh thu theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6F4E37" 
                  strokeWidth={3}
                  dot={{ fill: '#FFD580', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Package Sales Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-[#6F4E37] mb-4">Gói bán chạy</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={packageSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#6F4E37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;