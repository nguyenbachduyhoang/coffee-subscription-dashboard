import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import * as api from '../utils/apiClient';

interface Product {
  product_id: string | number;
  category_id: string | number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  image_id?: string;
}


const defaultForm: Product = {
  product_id: '',
  category_id: '',
  name: '',
  description: '',
  price: 0,
  image_url: '',
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Product>(defaultForm);
  const [priceInput, setPriceInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [filter, setFilter] = useState('');
  const [categories, setCategories] = useState<Array<{ category_id: number | string; name: string }>>([]);
  const pageSize = 10;

  // Resolve whatever comes from API/user into a numeric/string id
  const resolveCategoryId = (val: unknown): string => {
    if (typeof val === 'number') return String(val);
    const s = String(val ?? '');
    if (/^\d+$/.test(s)) return s;
    const normalize = (t: string) => t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const target = normalize(s);
    const found = categories.find(c => normalize(c.name) === target);
    return found ? String(found.category_id) : '';
  };

  const getCategoryNameByIdOrValue = (val: unknown): string => {
    const id = resolveCategoryId(val);
    const byId = categories.find(c => String(c.category_id) === String(id))?.name;
    if (byId) return byId;
    // Fallback: if backend already returned a name
    if (typeof val === 'string' && val.trim().length > 0) return val;
    return 'Danh mục';
  };
  // Filtered products by name (case-insensitive) and category
  const filteredProducts = products.filter(p => {
    const matchesName = p.name.toLowerCase().includes(filter.toLowerCase());
    // Resolve product's category into an ID-like string for reliable comparison
    const resolvedProductCatId = resolveCategoryId(p.category_id) || String(p.category_id);
    const matchesCategory = !categoryFilter || String(resolvedProductCatId) === String(categoryFilter);
    return matchesName && matchesCategory;
  });
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const pagedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const formatCurrency = (value: number) => {
    try {
      return value.toLocaleString('vi-VN') + ' đ';
    } catch {
      return `${value} đ`;
    }
  };

  const fetchProducts = () => {
    setLoading(true);
    api.getAllProducts()
      .then((all: any[]) => {
                 const mapped = all.map((p: any, idx: number) => {
           // category_id: prefer number or string, never name
           let category_id = p.category_id || p.categoryID || p.category || '';
           if (typeof category_id === 'object' && category_id !== null && 'id' in category_id) {
             category_id = category_id.id;
           }
           // Ensure we get the correct ID - try multiple possible fields
           const productId = p.productId || p.id || p.product_id || p.productID || p._id || (idx + 1);
           
           return {
             ...p,
             product_id: productId,
             category_id,
             image_url: p.image_url || p.imageUrl || p.img || '',
           };
         });
        setProducts(mapped);
        setLoading(false);
      })
             .catch(() => {
         setError('Không thể tải danh sách sản phẩm');
         toast.error('Không thể tải danh sách sản phẩm', {
           position: 'bottom-right',
           autoClose: 3000,
           hideProgressBar: false,
           closeOnClick: true,
           pauseOnHover: true,
           draggable: true,
         });
         setLoading(false);
       });
  };

  useEffect(() => {
    fetchProducts();
    api.getAllCategories()
      .then((cats) => {
        setCategories(cats);
        // Default select "Cà Phê" if available
        const normalizeText = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const coffee = cats.find(c => normalizeText(c.name).includes('ca phe'));
        if (coffee) {
          setCategoryFilter(String(coffee.category_id));
        }
      })
      .catch(() => setCategories([]));
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file' && name === 'image') {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        setImageFile(files[0]);
        setForm(f => ({ ...f, image_url: URL.createObjectURL(files[0]) }));
      }
    } else if (name === 'price') {
      // Format giá trị nhập vào có dấu phẩy
      const raw = value.replace(/[^\d]/g, '');
      const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setPriceInput(formatted);
      setForm(f => ({ ...f, price: Number(raw) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleAdd = () => {
    setForm(defaultForm);
    setPriceInput('');
    setImageFile(null);
    setIsEdit(false);
    setShowForm(true);
         // Test toast
     toast.info('Test toast - Add button clicked!', {
       position: 'bottom-right',
       autoClose: 2000,
     });
  };

  const handleEdit = (p: Product) => {
    // Always set category_id as the raw ID (number or string), not the name
    setForm({
      ...p,
      category_id:
        p.category_id && typeof p.category_id === 'object' && 'id' in (p.category_id as Record<string, unknown>)
          ? (p.category_id as Record<string, unknown>).id as string | number
          : (resolveCategoryId(p.category_id) || p.category_id),
      product_id: p.product_id,
    });
    setPriceInput(p.price ? p.price.toLocaleString('en-US') : '');
    setImageFile(null);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleDelete = (id: string | number) => {
    setDeleteId(id);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const formData = new FormData();
      if (isEdit) {
        formData.append('productId', String(form.product_id));
      }
      // Use exact keys expected by backend
      formData.append('name', form.name);
      formData.append('description', form.description);
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
        await api.updateProduct(formData);
      } else {
        await api.addProduct(formData);
      }

      setShowForm(false);
      console.log('About to show success toast');
             toast.success(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!', {
         position: 'bottom-right',
         autoClose: 2500,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
         progress: undefined,
       });
      console.log('Success toast called');
      fetchProducts();
         } catch (err: unknown) {
       console.log('About to show error toast:', err);
               toast.error('Có lỗi xảy ra khi lưu sản phẩm: ' + ((err as Error)?.message || ''), {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
       console.log('Error toast called');
     } finally {
      setActionLoading(false);
    }
  };

     const confirmDelete = async () => {
     if (!deleteId) return;
     setActionLoading(true);
     try {
       await api.deleteProduct(deleteId);
       setDeleteId(null);
               toast.success('Xóa sản phẩm thành công!', {
          position: 'bottom-right',
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
       fetchProducts();
     } catch (error) {
               toast.error('Có lỗi xảy ra khi xóa sản phẩm: ' + (error as Error)?.message, {
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
   };

  if (loading) return <div className="p-8 text-center">Đang tải sản phẩm...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
            {categories.map((c) => (
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
                key={p.image_id || p.product_id || idx}
                className="border-b last:border-b-0 hover:bg-[#f9f5f1] transition-colors duration-150 group"
                style={{ borderColor: '#f0e4d7' }}
              >
                <td className="py-3 px-5 font-mono text-sm align-middle">{p.product_id}</td>
                <td className="py-3 px-5 font-mono text-sm align-middle">{categories.find(c => String(c.category_id) === String(p.category_id))?.name || p.category_id}</td>
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
                    onClick={() => handleDelete(p.product_id)}
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
              <input id="name" name="name" value={form.name} onChange={handleInput} className="w-full border px-2 py-1 rounded" required placeholder="Nhập tên sản phẩm" title="Tên sản phẩm" />
            </div>
            <div className="mb-2">
              <label htmlFor="description" className="block text-sm mb-1">Mô tả</label>
              <textarea id="description" name="description" value={form.description} onChange={handleInput} className="w-full border px-2 py-1 rounded" required placeholder="Mô tả sản phẩm" title="Mô tả" />
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
                className="w-full border px-2 py-1 rounded"
                required
                min={0}
                placeholder="Nhập giá..."
                autoComplete="off"
                title="Giá"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="category_id" className="block text-sm mb-1">Danh mục</label>
              <select
                id="category_id"
                name="category_id"
                value={String(form.category_id)}
                onChange={handleInput}
                className="w-full border px-2 py-1 rounded"
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
                disabled={actionLoading}
              >Hủy</button>
              <button
                type="submit"
                className="px-4 py-1 bg-[#6F4E37] text-white rounded hover:bg-[#543826]"
                disabled={actionLoading}
              >{isEdit ? 'Lưu' : 'Thêm'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px]">
            <h3 className="text-lg font-bold mb-4">Xác nhận xóa sản phẩm?</h3>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setDeleteId(null)}
                disabled={actionLoading}
              >Hủy</button>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={confirmDelete}
                disabled={actionLoading}
              >Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
