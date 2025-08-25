import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye } from 'lucide-react';
import { getDemoData } from '../utils/demoData';

interface Order {
  id: string;
  userId: string;
  userName: string;
  packageName: string;
  total: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'vnpay' | 'card' | 'other';
}

const Orders: React.FC = () => {
  const { orders: initialOrders } = getDemoData();
  const [orders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentText = (method: string) => {
    switch (method) {
      case 'vnpay': return 'VNPay';
      case 'card': return 'Thẻ tín dụng';
      case 'other': return 'Khác';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-[#6F4E37] mb-6">Quản lý đơn hàng</h2>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm mã đơn hoặc tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
              >
                <option value="all">Tất cả phương thức</option>
                <option value="vnpay">VNPay</option>
                <option value="card">Thẻ tín dụng</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#6F4E37] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Mã đơn</th>
                  <th className="px-6 py-4 text-left font-semibold">Người mua</th>
                  <th className="px-6 py-4 text-left font-semibold">Gói</th>
                  <th className="px-6 py-4 text-left font-semibold">Giá</th>
                  <th className="px-6 py-4 text-left font-semibold">Ngày mua</th>
                  <th className="px-6 py-4 text-left font-semibold">Thanh toán</th>
                  <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-[#F5E9DD] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-[#6F4E37]">{order.userName}</td>
                    <td className="px-6 py-4 text-gray-600">{order.packageName}</td>
                    <td className="px-6 py-4 font-semibold text-[#6F4E37]">
                      {order.total.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.createdAt}</td>
                    <td className="px-6 py-4 text-gray-600">{getPaymentText(order.paymentMethod)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Orders;