import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { apiService } from '../services/apiService';
import { useApi, useMutation } from '../hooks/useApi';
import { Product } from '../types/api';
import { 
  useFormValidation, 
  productValidationSchema, 
  validateImageFile, 
  formatPrice, 
  parsePrice,
  getFieldError,
  hasFieldError 
} from '../utils/validation';
import DeleteModal from './DeleteModal';

// Product interface moved to types/api.ts


const defaultForm: Partial<Product> = {
  product_id: '',
  category_id: '',
  name: '',
  description: '',
  price: 0,
  image_url: '',
};

const Products: React.FC = () => {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Product>>(defaultForm);
  const [priceInput, setPriceInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [filter, setFilter] = useState('');
  const pageSize = 10;

  // API hooks
  const { data: products = [], loading, error, refetch } = useApi(
    () => apiService.getProducts(),
    []
  );

  const { data: categories = [], loading: categoriesLoading } = useApi(
    () => apiService.getCategories(),
    []
  );

  const createProductMutation = useMutation((formData: FormData) => 
    apiService.createProduct(formData)
  );
  
  const updateProductMutation = useMutation((formData: FormData) => 
    apiService.updateProduct(formData)
  );
  
  const deleteProductMutation = useMutation((id: string | number) => 
    apiService.deleteProduct(id)
  );

  const [actionLoading, setActionLoading] = useState(false);
  
  // Form validation
  const {
    errors: validationErrors,
    validateFieldRealtime,
    validateAllFields,
    clearErrors
  } = useFormValidation(productValidationSchema);
  
  // Combined loading and error states (for form usage)
  const isFormLoading = createProductMutation.loading || updateProductMutation.loading || deleteProductMutation.loading || actionLoading;

  // Resolve whatever comes from API/user into a numeric/string id
  const resolveCategoryId = useCallback((val: unknown): string => {
    if (typeof val === 'number') return String(val);
    const s = String(val ?? '');
    if (/^\d+$/.test(s)) return s;
    
    // Safety check for categories
    if (!categories || categories.length === 0) return '';
    
    const normalize = (t: string) => t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const target = normalize(s);
    const found = categories.find(c => normalize(c.name) === target);
    return found ? String(found.category_id) : '';
  }, [categories]);

  const getCategoryNameByIdOrValue = useCallback((val: unknown): string => {
    // Safety check for categories
    if (!categories || categories.length === 0) return 'Danh mục';
    
    const id = resolveCategoryId(val);
    const byId = categories.find(c => String(c.category_id) === String(id))?.name;
    if (byId) return byId;
    // Fallback: if backend already returned a name
    if (typeof val === 'string' && val.trim().length > 0) return val;
    return 'Danh mục';
  }, [categories, resolveCategoryId]);
  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return products.filter(p => {
      const matchesName = !filter || p.name.toLowerCase().includes(filter.toLowerCase());
      // Resolve product's category into an ID-like string for reliable comparison
      const resolvedProductCatId = resolveCategoryId(p.category_id) || String(p.category_id);
      const matchesCategory = !categoryFilter || String(resolvedProductCatId) === String(categoryFilter);
      return matchesName && matchesCategory;
    });
  }, [products, filter, categoryFilter, resolveCategoryId]);

  // Memoized pagination
  const { totalPages, pagedProducts } = useMemo(() => {
    const total = Math.ceil(filteredProducts.length / pageSize);
    const paged = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
    return { totalPages: total, pagedProducts: paged };
  }, [filteredProducts, page, pageSize]);

  const formatCurrency = (value: number) => {
    try {
      return value.toLocaleString('vi-VN') + ' đ';
    } catch {
      return `${value} đ`;
    }
  };

  // Set default category filter to coffee when categories load
  useEffect(() => {
    if (categories && categories.length > 0 && !categoryFilter) {
      const normalizeText = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const coffee = categories?.find(c => normalizeText(c.name).includes('ca phe'));
      if (coffee) {
        setCategoryFilter(String(coffee.category_id));
      }
    }
  }, [categories, categoryFilter]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file' && name === 'image') {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        // Validate image file
        const imageError = validateImageFile(files[0], !isEdit);
        if (imageError) {
          toast.error(imageError);
          return;
        }
        
        setImageFile(files[0]);
        setForm(f => ({ ...f, image_url: URL.createObjectURL(files[0]) }));
      }
    } else if (name === 'price') {
      // Format giá trị nhập vào có dấu phẩy
      const raw = value.replace(/[^\d]/g, '');
      const formatted = formatPrice(raw);
      const numericValue = parsePrice(formatted);
      
      setPriceInput(formatted);
      setForm(f => ({ ...f, price: numericValue }));
      
      // Validate price real-time
      validateFieldRealtime('price', numericValue);
    } else {
      setForm(f => ({ ...f, [name]: value }));
      
      // Validate field real-time
      validateFieldRealtime(name, value);
    }
  }, [isEdit, validateFieldRealtime]);

  const handleAdd = useCallback(() => {
    setForm(defaultForm);
    setPriceInput('');
    setImageFile(null);
    setIsEdit(false);
    setShowForm(true);
    clearErrors(); // Clear validation errors
  }, [clearErrors]);

  const handleEdit = useCallback((p: Product) => {
    // Find the correct category ID from categories list
    let formCategoryId = '';
    
    if (categories && categories.length > 0) {
      // Try to find category by ID first
      let matchedCategory = categories.find(c => 
        String(c.category_id) === String(p.category_id)
      );
      
      // If not found by ID, try to find by name (case insensitive)
      if (!matchedCategory && typeof p.category_id === 'string') {
        const normalize = (text: string) => text.toLowerCase().trim();
        matchedCategory = categories.find(c => 
          normalize(c.name) === normalize(p.category_id as string)
        );
      }
      
      // Use the matched category ID, or fallback to product's category_id
      formCategoryId = matchedCategory 
        ? String(matchedCategory.category_id)
        : String(p.category_id || '');
    }
    
    console.log('🎯 Matched category:', {
      productCategory: p.category_id,
      formCategoryId,
      categories
    });
    
    setForm({
      ...p,
      category_id: formCategoryId,
      product_id: p.product_id,
    });
    setPriceInput(p.price ? formatPrice(String(p.price)) : '');
    setImageFile(null);
    setIsEdit(true);
    setShowForm(true);
    clearErrors(); // Clear validation errors
  }, [categories, clearErrors]);

  const handleDelete = useCallback((product: Product) => {
    setDeleteProduct(product);
  }, []);

  const submitForm = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validationResult = validateAllFields(form);
    
    // Validate image file
    const imageError = validateImageFile(imageFile, !isEdit);
    if (imageError) {
      toast.error(imageError);
      return;
    }
    
    if (!validationResult.isValid) {
      toast.error('Vui lòng sửa các lỗi trong form trước khi lưu');
      return;
    }
    
    setActionLoading(true);
    try {
      const formData = new FormData();
      if (isEdit) {
        formData.append('productId', String(form.product_id));
      }
      // Use exact keys expected by backend
      if (form.name) formData.append('name', form.name);
      if (form.description) formData.append('description', form.description);
      const catId = resolveCategoryId(form.category_id);
      if (!catId) {
        throw new Error('Danh mục không hợp lệ');
      }
      formData.append('categoryId', catId);
      formData.append('price', String(form.price));
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (!isEdit) {
        formData.append('image', '');
      }

      if (isEdit) {
        await updateProductMutation.mutate(formData);
      } else {
        await createProductMutation.mutate(formData);
      }

      setShowForm(false);
      toast.success(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!', {
        position: 'bottom-right',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      refetch();
    } catch (err: unknown) {
      toast.error('Có lỗi xảy ra khi lưu sản phẩm: ' + ((err as Error)?.message || ''), {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setActionLoading(false);
    }
  }, [form, imageFile, isEdit, createProductMutation, updateProductMutation, refetch, validateAllFields]);

  const confirmDelete = useCallback(async () => {
    if (!deleteProduct) return;
    try {
      await deleteProductMutation.mutate(deleteProduct.product_id);
      setDeleteProduct(null);
      toast.success('Xóa sản phẩm thành công!', {
        position: 'bottom-right',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      refetch();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm: ' + (error as Error)?.message, {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [deleteProduct, deleteProductMutation, refetch]);

  // Wait for both products and categories to load before rendering
  if (loading || categoriesLoading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!categories || categories.length === 0) return <div className="p-8 text-center">Không thể tải danh mục...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Danh sách sản phẩm</h2>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            className="px-3 py-2 border rounded w-full sm:w-72"
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setPage(1); // Reset về trang đầu khi filter
            }}
          />
          <select
            className="px-3 py-2 border rounded w-full sm:w-56"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            title="Lọc theo danh mục"
          >
            <option value="">Tất cả danh mục</option>
            {categories?.map((c) => (
              <option key={`${c.category_id}-${c.name}`} value={String(c.category_id)}>{c.name}</option>
            ))}
          </select>
        </div>
        <button
          className="px-4 py-2 bg-[#6F4E37] text-white rounded hover:bg-[#543826] sm:ml-auto whitespace-nowrap shrink-0"
          onClick={handleAdd}
        >
          + Thêm sản phẩm
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow-xl border border-[#f0e4d7]">
          <thead>
            <tr className="bg-[#F5E9DD] text-[#6F4E37] text-base font-bold rounded-t-2xl">
              <th className="py-4 px-5 text-left rounded-tl-2xl">ID</th>
              <th className="py-4 px-5 text-left">Category</th>
              <th className="py-4 px-5 text-left">Tên</th>
              {/* <th className="py-4 px-5 text-left">Mô tả</th> */}
              <th className="py-4 px-5 text-right">Giá</th>
              <th className="py-4 px-5 text-center">Ảnh</th>
              <th className="py-4 px-5 text-center rounded-tr-2xl">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.map((p, idx) => (
              <tr
                key={p.product_id || idx}
                className="border-b last:border-b-0 hover:bg-[#f9f5f1] transition-colors duration-150 group"
                data-border-color="#f0e4d7"
              >
                <td className="py-3 px-5 font-mono text-sm align-middle">{p.product_id}</td>
                <td className="py-3 px-5 font-mono text-sm align-middle">{getCategoryNameByIdOrValue(p.category_id)}</td>
                <td className="py-3 px-5 font-semibold align-middle text-[#3d2c1e]">{p.name}</td>
                {/* <td className="py-3 px-5 max-w-xs truncate" title={p.description}>{p.description}</td> */}
                <td className="py-3 px-5 text-right align-middle text-[#6F4E37] font-medium">{p.price.toLocaleString()} đ</td>
                <td className="py-3 px-5 text-center align-middle">
                  <div className="flex justify-center items-center">
                    <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded-xl border border-[#e2d3c2] shadow-sm" />
                  </div>
                </td>
                <td className="py-3 px-5 flex gap-2 justify-center items-center align-middle">
                  <button
                    title="Xem mô tả"
                    className="p-2 rounded-full hover:bg-yellow-100 text-yellow-600 text-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    onClick={() => setSelectedProduct(p)}
                  >
                    <MdVisibility />
                  </button>
                  <button
                    title="Sửa"
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600 text-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => handleEdit(p)}
                  >
                    <MdEdit />
                  </button>
                  <button
                    title="Xóa"
                    className="p-2 rounded-full hover:bg-red-100 text-red-600 text-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300"
                    onClick={() => handleDelete(p)}
                  >
                    <MdDelete />
                  </button>
                </td>
                {/* ...existing code... */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-[#F5E9DD] text-[#6F4E37] font-semibold disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded font-semibold ${page === i + 1 ? 'bg-[#6F4E37] text-white' : 'bg-[#F5E9DD] text-[#6F4E37]'}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-[#F5E9DD] text-[#6F4E37] font-semibold disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-bold text-[#3d2c1e] truncate pr-4">{selectedProduct.name}</h3>
              <button
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => setSelectedProduct(null)}
              >Đóng</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
              <div className="md:col-span-1">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-56 object-cover rounded-xl border border-[#e2d3c2]"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-[#F5E9DD] text-[#6F4E37] font-semibold">
                      {getCategoryNameByIdOrValue(selectedProduct.category_id)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Giá</div>
                    <div className="text-2xl font-extrabold text-[#6F4E37] tracking-wide">{formatCurrency(selectedProduct.price)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-[#6F4E37] mb-1">Mô tả chi tiết</h4>
                  <div className="text-sm leading-6 whitespace-pre-line break-words bg-[#faf7f3] border border-[#f0e4d7] rounded-lg p-4">
                    {selectedProduct.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded-lg shadow-lg min-w-[350px] max-w-[90vw]"
            onSubmit={submitForm}
          >
            <h3 className="text-lg font-bold mb-4">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
            <div className="mb-2">
              <label htmlFor="name" className="block text-sm mb-1">Tên sản phẩm</label>
              <input 
                id="name" 
                name="name" 
                value={form.name || ''} 
                onChange={handleInput} 
                className={`w-full border px-2 py-1 rounded ${hasFieldError(validationErrors, 'name') ? 'border-red-500' : 'border-gray-300'}`}
                required 
                placeholder="Nhập tên sản phẩm" 
                title="Tên sản phẩm" 
              />
              {getFieldError(validationErrors, 'name') && (
                <div className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'name')}</div>
              )}
            </div>
            <div className="mb-2">
              <label htmlFor="description" className="block text-sm mb-1">Mô tả</label>
              <textarea 
                id="description" 
                name="description" 
                value={form.description || ''} 
                onChange={handleInput} 
                className={`w-full border px-2 py-1 rounded ${hasFieldError(validationErrors, 'description') ? 'border-red-500' : 'border-gray-300'}`}
                required 
                placeholder="Mô tả sản phẩm" 
                title="Mô tả"
                rows={3}
              />
              {getFieldError(validationErrors, 'description') && (
                <div className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'description')}</div>
              )}
            </div>
            <div className="mb-2">
              <label htmlFor="price" className="block text-sm mb-1">Giá</label>
              <input
                id="price"
                name="price"
                type="text"
                inputMode="numeric"
                value={priceInput}
                onChange={handleInput}
                className={`w-full border px-2 py-1 rounded ${hasFieldError(validationErrors, 'price') ? 'border-red-500' : 'border-gray-300'}`}
                required
                min={0}
                placeholder="Nhập giá (VD: 50,000)"
                autoComplete="off"
                title="Giá"
              />
              {getFieldError(validationErrors, 'price') && (
                <div className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'price')}</div>
              )}
            </div>
            <div className="mb-2">
              <label htmlFor="category_id" className="block text-sm mb-1">Danh mục</label>
              <select
                id="category_id"
                name="category_id"
                value={String(form.category_id)}
                onChange={handleInput}
                className={`w-full border px-2 py-1 rounded ${hasFieldError(validationErrors, 'category_id') ? 'border-red-500' : 'border-gray-300'}`}
                required
                title="Chọn danh mục"
              >
                <option value="" disabled>-- Chọn danh mục --</option>
                {categories.map((c) => {
                  const key = `${String(c.category_id)}-${c.name}`;
                  return (
                    <option key={key} value={String(c.category_id)}>{c.name}</option>
                  );
                })}
              </select>
              {getFieldError(validationErrors, 'category_id') && (
                <div className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'category_id')}</div>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="image" className="block text-sm mb-1">Ảnh (file)</label>
              <input id="image" name="image" type="file" accept="image/*" onChange={handleInput} className="w-full border px-2 py-1 rounded" required={!isEdit} title="Chọn ảnh" />
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded" />
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowForm(false)}
                disabled={isFormLoading}
              >Hủy</button>
              <button
                type="submit"
                className="px-4 py-1 bg-[#6F4E37] text-white rounded hover:bg-[#543826]"
                disabled={isFormLoading}
              >{isEdit ? 'Lưu' : 'Thêm'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={confirmDelete}
        title="Xóa sản phẩm"
        itemName={deleteProduct?.name}
        loading={deleteProductMutation.loading}
      />
    </div>
  );
};

export default Products;
