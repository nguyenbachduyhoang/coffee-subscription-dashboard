import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, Eye, Plus, X } from 'lucide-react';
import { getDemoData, updateUser, deleteUser, addUser } from '../utils/demoData';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  status: 'active' | 'inactive';
}

const Users: React.FC = () => {
  const { users: initialUsers } = getDemoData();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (user: User | null, mode: 'view' | 'edit' | 'add') => {
    setSelectedUser(user);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSave = (userData: Partial<User>) => {
    if (modalMode === 'add') {
      const newUser = addUser(userData as Omit<User, 'id'>);
      setUsers([...users, newUser]);
    } else if (modalMode === 'edit' && selectedUser) {
      const updatedUser = updateUser(selectedUser.id, userData);
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
    }
    closeModal();
  };

  const handleDelete = (userId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-[#6F4E37] mb-4 md:mb-0">Quản lý người dùng</h2>
          <button
            onClick={() => openModal(null, 'add')}
            className="bg-[#6F4E37] text-white px-4 py-2 rounded-lg hover:bg-[#5A3E2D] transition-colors duration-200 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#6F4E37] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Tên</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">SĐT</th>
                  <th className="px-6 py-4 text-left font-semibold">Ngày đăng ký</th>
                  <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-[#F5E9DD] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">{user.id}</td>
                    <td className="px-6 py-4 font-medium text-[#6F4E37]">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{user.registeredAt}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(user, 'view')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(user, 'edit')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

interface UserModalProps {
  user: User | null;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    status: user?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#6F4E37]">
            {mode === 'add' ? 'Thêm người dùng' : mode === 'edit' ? 'Chỉnh sửa người dùng' : 'Chi tiết người dùng'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none disabled:bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none disabled:bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none disabled:bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none disabled:bg-gray-50"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          {mode !== 'view' && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#6F4E37] text-white rounded-lg hover:bg-[#5A3E2D] transition-colors duration-200"
              >
                {mode === 'add' ? 'Thêm' : 'Lưu'}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Users;