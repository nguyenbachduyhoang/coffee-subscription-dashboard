import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { planApi, Plan, CreatePlanRequest, UpdatePlanRequest, Product } from '../utils/apiPlan';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 items per page for 2x3 grid

  // Helper function to show success message
  const showSuccessMessage = (message: string) => {
    console.log('Setting success message:', message);
    setSuccessMessage(message);
    setTimeout(() => {
      console.log('Auto-hiding success message');
      setSuccessMessage(null);
    }, 3000);
  };

  // Convert Plan to Package
  const convertPlanToPackage = (plan: Plan): Package => {
    console.log('Converting plan to package:', plan);
    return {
      id: plan.planId?.toString() || '0',
      name: plan.name || '',
      price: plan.price || 0,
      duration: Math.ceil((plan.durationDays || 1) / 30), // Convert days to months
      durationDays: plan.durationDays || 1,
      description: plan.description || '',
      productName: plan.productName || '',
      productId: 0, // Default value, this should be updated according to your API response
      imageUrl: plan.imageUrl || '',
      dailyQuota: plan.dailyQuota || 1,
      maxPerVisit: plan.maxPerVisit || 1,
      active: plan.active !== undefined ? plan.active : true
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
  const loadPackages = useCallback(async (clearSuccessMessage: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      if (clearSuccessMessage) {
        setSuccessMessage(null); // Only clear success message when explicitly requested
      }
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

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      const products = await planApi.getAllProducts();
      setProducts(products);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }, []);

  useEffect(() => {
    loadPackages();
    loadProducts();
  }, [loadPackages, loadProducts]);

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
        console.log('Create request:', createRequest);
        
        const newPlan = await planApi.createPlan(createRequest);
        console.log('New plan from API:', newPlan);
        
        if (!newPlan) {
          throw new Error('API trả về dữ liệu không hợp lệ');
        }
        
        const newPackage = convertPlanToPackage(newPlan);
        console.log('Converted package:', newPackage);
        
        setPackages([...packages, newPackage]);
        showSuccessMessage('Tạo gói dịch vụ thành công!');
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
        
        if (!updatedPlan) {
          throw new Error('API trả về dữ liệu không hợp lệ');
        }
        
        const updatedPackage = convertPlanToPackage(updatedPlan);
        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p));
        showSuccessMessage('Cập nhật gói dịch vụ thành công!');
      }
      closeModal();
      // Don't reload immediately to avoid clearing success message
      // await loadPackages(false);
    } catch (err: unknown) {
      console.error('Error saving package:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu gói dịch vụ';
      alert(errorMessage);
    }
  };

  const handleUnactivePlan = async (packageId: string) => {
    if (confirm('Bạn có chắc chắn muốn vô hiệu hóa gói dịch vụ này?')) {
      try {
        await planApi.unactivePlan(parseInt(packageId));
        showSuccessMessage('Vô hiệu hóa gói dịch vụ thành công!');
        // Reload data from server to get latest status
        await loadPackages(false);
      } catch (err) {
        console.error('Error unactivating plan:', err);
        alert('Có lỗi xảy ra khi vô hiệu hóa gói dịch vụ');
      }
    }
  };

  console.log('Render - successMessage:', successMessage);

  // Pagination calculations
  const totalPages = Math.ceil(packages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPackages = packages.slice(startIndex, endIndex);

  // Reset to first page when packages change
  useEffect(() => {
    setCurrentPage(1);
  }, [packages.length]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
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

        {/* Success Message - Fixed position at top right */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, x: 300, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 300, y: -20 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 min-w-80 max-w-96"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
                <div className="ml-3">
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600 transition-colors duration-200"
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              onClick={() => loadPackages()}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Packages Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 h-full flex flex-col ${
                    pkg.active ? 'ring-2 ring-[#FFD580]' : ''
                  }`}
                >
                  {pkg.active && (
                    <div className="bg-[#FFD580] text-[#6F4E37] text-center py-2 font-semibold text-sm flex-shrink-0">
                      GÓI ĐANG HOẠT ĐỘNG
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Image */}
                    {pkg.imageUrl && (
                      <div className="mb-4 flex-shrink-0">
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
                    
                    <h3 className="text-xl font-bold text-[#6F4E37] mb-2 flex-shrink-0">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-[#6F4E37] mb-2 flex-shrink-0">
                      {pkg.price.toLocaleString('vi-VN')}₫
                      <span className="text-sm font-normal text-gray-600">/{pkg.duration === 1 ? `${pkg.durationDays} ngày` : `${pkg.duration} tháng`}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2 flex-shrink-0">
                      <strong>Sản phẩm:</strong> {pkg.productName}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2 flex-shrink-0">
                      <strong>Hạn mức:</strong> {pkg.dailyQuota} ly/ngày, tối đa {pkg.maxPerVisit} ly/lần
                    </div>
                    
                    <p className="text-gray-600 mb-4 flex-grow">{pkg.description}</p>

                    <div className="flex space-x-2 mt-auto flex-shrink-0">
                      <button
                        onClick={() => openModal(pkg, 'edit')}
                        className="flex-1 bg-[#6F4E37] text-white py-2 px-4 rounded-lg hover:bg-[#5A3E2D] transition-colors duration-200 flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa
                      </button>
                      {pkg.active && (
                        <button
                          onClick={() => handleUnactivePlan(pkg.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                          title="Vô hiệu hóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                      currentPage === page
                        ? 'bg-[#6F4E37] text-white'
                        : 'text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
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
          products={products}
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
  products: Product[];
  mode: 'edit' | 'add';
  onClose: () => void;
  onSave: (packageData: Partial<Package>) => void;
}

const PackageModal: React.FC<PackageModalProps> = ({ package: pkg, products, mode, onClose, onSave }) => {
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Sản phẩm</label>
            <select
              value={formData.productId}
              onChange={(e) => {
                const selectedProductId = Number(e.target.value);
                const selectedProduct = products.find(p => p.productId === selectedProductId);
                setFormData({ 
                  ...formData, 
                  productId: selectedProductId,
                  productName: selectedProduct?.name || ''
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD580] focus:border-transparent outline-none"
              required
            >
              <option value={0}>Chọn sản phẩm...</option>
              {products.map((product) => (
                <option key={product.productId} value={product.productId}>
                  {product.name}
                </option>
              ))}
            </select>
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