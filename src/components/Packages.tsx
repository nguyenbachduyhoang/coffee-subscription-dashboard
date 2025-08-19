import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { getDemoData, updatePackage, deletePackage, addPackage } from '../utils/demoData';

interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
  isPopular: boolean;
}

const Packages: React.FC = () => {
  const { packages: initialPackages } = getDemoData();
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');

  const openModal = (pkg: Package | null, mode: 'edit' | 'add') => {
    setSelectedPackage(pkg);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const handleSave = (packageData: Partial<Package>) => {
    if (modalMode === 'add') {
      const newPackage = addPackage(packageData as Omit<Package, 'id'>);
      setPackages([...packages, newPackage]);
    } else if (modalMode === 'edit' && selectedPackage) {
      const updatedPackage = updatePackage(selectedPackage.id, packageData);
      setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p));
    }
    closeModal();
  };

  const handleDelete = (packageId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) {
      deletePackage(packageId);
      setPackages(packages.filter(p => p.id !== packageId));
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#6F4E37]">Quản lý gói dịch vụ</h2>
          <button
            onClick={() => openModal(null, 'add')}
            className="bg-[#6F4E37] text-white px-4 py-2 rounded-lg hover:bg-[#5A3E2D] transition-colors duration-200 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm gói mới
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 ${
                pkg.isPopular ? 'ring-2 ring-[#FFD580]' : ''
              }`}
            >
              {pkg.isPopular && (
                <div className="bg-[#FFD580] text-[#6F4E37] text-center py-2 font-semibold text-sm">
                  GÓI PHỔ BIẾN
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#6F4E37] mb-2">{pkg.name}</h3>
                <div className="text-3xl font-bold text-[#6F4E37] mb-4">
                  {pkg.price.toLocaleString('vi-VN')}₫
                  <span className="text-sm font-normal text-gray-600">/{pkg.duration} tháng</span>
                </div>
                
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-[#6F4E37] rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(pkg, 'edit')}
                    className="flex-1 bg-[#6F4E37] text-white py-2 px-4 rounded-lg hover:bg-[#5A3E2D] transition-colors duration-200 flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <PackageModal
          package={selectedPackage}
          mode={modalMode}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

interface PackageModalProps {
  package: Package | null;
  mode: 'edit' | 'add';
  onClose: () => void;
  onSave: (packageData: Partial<Package>) => void;
}

const PackageModal: React.FC<PackageModalProps> = ({ package: pkg, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    price: pkg?.price || 0,
    duration: pkg?.duration || 1,
    description: pkg?.description || '',
    features: pkg?.features.join('\n') || '',
    isPopular: pkg?.isPopular || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      features: formData.features.split('\n').filter(f => f.trim())
    });
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
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#6F4E37]">
            {mode === 'add' ? 'Thêm gói dịch vụ' : 'Chỉnh sửa gói dịch vụ'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên gói</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời hạn (tháng)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tính năng (mỗi dòng một tính năng)</label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
              rows={4}
              placeholder="Giao hàng miễn phí&#10;Tư vấn 24/7&#10;Cà phê chất lượng cao"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPopular"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              className="w-4 h-4 text-[#6F4E37] border-gray-300 rounded focus:ring-[#FFD580]"
            />
            <label htmlFor="isPopular" className="ml-2 text-sm text-gray-700">Gói phổ biến</label>
          </div>

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
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Packages;