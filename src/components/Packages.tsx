import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { planApi, Plan, CreatePlanRequest, UpdatePlanRequest } from '../utils/apiPlan';

interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationDays: number;
  description: string;
  productName: string;
  productId: number;
  imageUrl: string;
  dailyQuota: number;
  maxPerVisit: number;
  active: boolean;
}

const Packages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Plan to Package
  const convertPlanToPackage = (plan: Plan): Package => {
    return {
      id: plan.planId.toString(),
      name: plan.name,
      price: plan.price,
      duration: Math.ceil(plan.durationDays / 30), // Convert days to months
      durationDays: plan.durationDays,
      description: plan.description,
      productName: plan.productName,
      productId: 0, // Default value, this should be updated according to your API response
      imageUrl: plan.imageUrl,
      dailyQuota: plan.dailyQuota,
      maxPerVisit: plan.maxPerVisit,
      active: plan.active
    };
  };

  // Convert Package to CreatePlanRequest
  const convertPackageToCreateRequest = (pkg: Partial<Package>): CreatePlanRequest => {
    return {
      name: pkg.name || '',
      description: pkg.description || '',
      productId: parseInt(pkg.productId?.toString() || '0'),
      price: pkg.price || 0,
      durationDays: pkg.durationDays || 1, // Use durationDays directly, not duration * 30
      dailyQuota: pkg.dailyQuota || 1,
      maxPerVisit: pkg.maxPerVisit || 1,
      active: pkg.active !== undefined ? pkg.active : true
    };
  };

  // Load packages from API
  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const plans = await planApi.getAllPlans();
      const convertedPackages = plans.map(convertPlanToPackage);
      setPackages(convertedPackages);
    } catch (err) {
      setError('Không thể tải dữ liệu gói dịch vụ');
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const openModal = (pkg: Package | null, mode: 'edit' | 'add') => {
    setSelectedPackage(pkg);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const handleSave = async (packageData: Partial<Package>) => {
    try {
      if (modalMode === 'add') {
        const createRequest = convertPackageToCreateRequest(packageData);
        const newPlan = await planApi.createPlan(createRequest);
        const newPackage = convertPlanToPackage(newPlan);
        setPackages([...packages, newPackage]);
      } else if (modalMode === 'edit' && selectedPackage) {
        const updateRequest: UpdatePlanRequest = {
          name: packageData.name,
          description: packageData.description,
          productId: packageData.productId,
          imageUrl: packageData.imageUrl,
          price: packageData.price,
          durationDays: packageData.durationDays,
          dailyQuota: packageData.dailyQuota,
          maxPerVisit: packageData.maxPerVisit,
          active: packageData.active
        };
        const updatedPlan = await planApi.updatePlan(parseInt(selectedPackage.id), updateRequest);
        const updatedPackage = convertPlanToPackage(updatedPlan);
        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p));
      }
      closeModal();
    } catch (err) {
      console.error('Error saving package:', err);
      alert('Có lỗi xảy ra khi lưu gói dịch vụ');
    }
  };

  const handleDelete = async (packageId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) {
      try {
        await planApi.deletePlan(parseInt(packageId));
        setPackages(packages.filter(p => p.id !== packageId));
      } catch (err) {
        console.error('Error deleting package:', err);
        alert('Có lỗi xảy ra khi xóa gói dịch vụ');
      }
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
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm gói mới
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6F4E37]"></div>
            <span className="ml-2 text-[#6F4E37]">Đang tải...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadPackages}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Packages Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 ${
                  pkg.active ? 'ring-2 ring-[#FFD580]' : ''
                }`}
              >
                {pkg.active && (
                  <div className="bg-[#FFD580] text-[#6F4E37] text-center py-2 font-semibold text-sm">
                    GÓI ĐANG HOẠT ĐỘNG
                  </div>
                )}
                
                <div className="p-6">
                  {/* Image */}
                  {pkg.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.name}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-[#6F4E37] mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-[#6F4E37] mb-2">
                    {pkg.price.toLocaleString('vi-VN')}₫
                    <span className="text-sm font-normal text-gray-600">/{pkg.duration === 1 ? `${pkg.durationDays} ngày` : `${pkg.duration} tháng`}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Sản phẩm:</strong> {pkg.productName}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Hạn mức:</strong> {pkg.dailyQuota} ly/ngày, tối đa {pkg.maxPerVisit} ly/lần
                  </div>
                  
                  <p className="text-gray-600 mb-4">{pkg.description}</p>

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
        )}

        {/* Empty State */}
        {!loading && !error && packages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Chưa có gói dịch vụ nào</p>
            <button
              onClick={() => openModal(null, 'add')}
              className="bg-[#6F4E37] text-white px-4 py-2 rounded-lg hover:bg-[#5A3E2D] transition-colors duration-200"
            >
              Thêm gói đầu tiên
            </button>
          </div>
        )}
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
    durationDays: pkg?.durationDays || 1,
    description: pkg?.description || '',
    productName: pkg?.productName || '',
    productId: pkg?.productId || 0,
    imageUrl: pkg?.imageUrl || '',
    dailyQuota: pkg?.dailyQuota || 1,
    maxPerVisit: pkg?.maxPerVisit || 1,
    active: pkg?.active !== undefined ? pkg?.active : true
  });

  const [priceDisplay, setPriceDisplay] = useState(
    formData.price ? formData.price.toLocaleString('vi-VN') : ''
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    const numberValue = parseInt(numericValue) || 0;
    
    // Update the actual price value
    setFormData({ ...formData, price: numberValue });
    // Update the display value with formatting
    setPriceDisplay(numberValue ? numberValue.toLocaleString('vi-VN') : '');
  };

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID sản phẩm</label>
            <input
              type="number"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
              <input
                type="text"
                value={priceDisplay}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời hạn (ngày)</label>
              <input
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hạn mức hàng ngày</label>
              <input
                type="number"
                value={formData.dailyQuota}
                onChange={(e) => setFormData({ ...formData, dailyQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tối đa mỗi lần</label>
              <input
                type="number"
                value={formData.maxPerVisit}
                onChange={(e) => setFormData({ ...formData, maxPerVisit: Number(e.target.value) })}
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

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-[#6F4E37] border-gray-300 rounded focus:ring-[#FFD580]"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">Kích hoạt</label>
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