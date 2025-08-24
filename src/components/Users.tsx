import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useApi, useMutation } from '../hooks/useApi';
import { User } from '../types/api';
import UserModal from './UserModal';
import DeleteModal from './DeleteModal';

// User interface moved to types/api.ts

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // API hooks
  const { data: users = [], loading, error, refetch } = useApi(
    () => apiService.getUsers(),
    []
  );

  const createUserMutation = useMutation((userData: Partial<User>) => 
    apiService.createUser(userData)
  );
  
  const updateUserMutation = useMutation(({ id, userData }: { id: string; userData: Partial<User> }) => 
    apiService.updateUser(id, userData)
  );
  
  const deleteUserMutation = useMutation((id: string) => 
    apiService.deleteUser(id)
  );

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    if (!searchTerm) return users;
    
    const searchLower = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }, [users, searchTerm]);

  const openModal = useCallback((user: User | null, mode: 'view' | 'edit' | 'add') => {
    setSelectedUser(user);
    setModalMode(mode);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedUser(null);
    // Reset mutation errors
    createUserMutation.reset();
    updateUserMutation.reset();
  }, [createUserMutation, updateUserMutation]);

  const handleSave = useCallback(async (userData: Partial<User>) => {
    try {
      if (modalMode === 'add') {
        await createUserMutation.mutate(userData);
      } else if (modalMode === 'edit' && selectedUser) {
        await updateUserMutation.mutate({ id: selectedUser.id, userData });
      }
      await refetch(); // Refresh list
      closeModal();
    } catch (err) {
      // Error is already handled by mutation hook
      console.error('Error saving user:', err);
    }
  }, [modalMode, selectedUser, createUserMutation, updateUserMutation, refetch, closeModal]);

  const handleDelete = useCallback((user: User) => {
    setDeleteUser(user);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteUser) return;
    try {
      await deleteUserMutation.mutate(deleteUser.id);
      await refetch(); // Refresh list
      setDeleteUser(null);
    } catch (err) {
      // Error is already handled by mutation hook
      console.error('Error deleting user:', err);
    }
  }, [deleteUser, deleteUserMutation, refetch]);

  // Combined error from all sources
  const combinedError = error || createUserMutation.error || updateUserMutation.error || deleteUserMutation.error;
  const isAnyLoading = loading || createUserMutation.loading || updateUserMutation.loading || deleteUserMutation.loading;

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

        {/* Error Message */}
        {combinedError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {combinedError}
          </div>
        )}

        {/* Loading State */}
        {isAnyLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6F4E37]"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Users Table */}
        {!isAnyLoading && (
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
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(user, 'edit')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Xóa"
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
        )}

        {filteredUsers.length === 0 && !isAnyLoading && (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy người dùng nào.
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <UserModal
        user={selectedUser}
        mode={modalMode}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        loading={createUserMutation.loading || updateUserMutation.loading}
        error={createUserMutation.error || updateUserMutation.error}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={confirmDelete}
        title="Xóa người dùng"
        itemName={deleteUser ? `${deleteUser.name} (${deleteUser.email})` : ''}
        loading={deleteUserMutation.loading}
      />
    </div>
  );
};

export default Users;