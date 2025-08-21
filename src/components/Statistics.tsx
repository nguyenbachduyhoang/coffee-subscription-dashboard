import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Statistics: React.FC = () => {
  const monthlyRevenue = [
    { month: 'T1/2024', revenue: 45000000 },
    { month: 'T2/2024', revenue: 52000000 },
    { month: 'T3/2024', revenue: 48000000 },
    { month: 'T4/2024', revenue: 61000000 },
    { month: 'T5/2024', revenue: 55000000 },
    { month: 'T6/2024', revenue: 67000000 },
    { month: 'T7/2024', revenue: 72000000 },
    { month: 'T8/2024', revenue: 68000000 },
    { month: 'T9/2024', revenue: 75000000 },
    { month: 'T10/2024', revenue: 82000000 },
    { month: 'T11/2024', revenue: 78000000 },
    { month: 'T12/2024', revenue: 89000000 },
  ];

  const packageSales = [
    { name: 'Gói 150K', sales: 145, revenue: 21750000 },
    { name: 'Gói 300K', sales: 128, revenue: 38400000 },
    { name: 'Gói 450K', sales: 89, revenue: 40050000 },
    { name: 'Gói 600K', sales: 67, revenue: 40200000 },
  ];

  const paymentMethods = [
    { name: 'VNPay', value: 45, color: '#6F4E37' },
    { name: 'Thẻ tín dụng', value: 35, color: '#FFD580' },
    { name: 'Khác', value: 20, color: '#DCC1A1' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-[#6F4E37] mb-6">Thống kê và báo cáo</h2>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-[#6F4E37] mb-4">Doanh thu theo tháng (2024)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6F4E37" />
              <YAxis stroke="#6F4E37" />
              <Tooltip 
                formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']}
                labelStyle={{ color: '#6F4E37' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6F4E37" 
                strokeWidth={3}
                dot={{ fill: '#FFD580', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#FFD580' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package Sales Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-[#6F4E37] mb-4">Số lượng gói bán ra</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={packageSales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6F4E37" />
                <YAxis stroke="#6F4E37" />
                <Tooltip 
                  formatter={(value: number) => [value, 'Số lượng']}
                  labelStyle={{ color: '#6F4E37' }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#6F4E37" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Payment Methods Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-[#6F4E37] mb-4">Tỉ lệ phương thức thanh toán</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, 'Tỉ lệ']} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Revenue by Package */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-[#6F4E37] mb-4">Doanh thu theo gói dịch vụ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={packageSales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6F4E37" />
              <YAxis stroke="#6F4E37" />
              <Tooltip 
                formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']}
                labelStyle={{ color: '#6F4E37' }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#FFD580" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Statistics;