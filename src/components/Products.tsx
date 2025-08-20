import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [viewDesc, setViewDesc] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const pageSize = 10;
  // Filtered products by name (case-insensitive)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const pagedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

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
          return {
            ...p,
            product_id: p.product_id || p.productID || p.id || p._id || (idx + 1),
            category_id,
            image_url: p.image_url || p.imageUrl || p.img || '',
          };
        });
        setProducts(mapped);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải danh sách sản phẩm');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  };

  const handleEdit = (p: Product) => {
    // Always set category_id as the raw ID (number or string), not the name
    setForm({
      ...p,
      category_id:
        p.category_id && typeof p.category_id === 'object' && 'id' in (p.category_id as Record<string, unknown>)
          ? (p.category_id as Record<string, unknown>).id as string | number
          : p.category_id,
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
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('categoryId', String(form.category_id));
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
      toast.success(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!', {
        position: 'top-center',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      fetchProducts();
    } catch (err: unknown) {
      alert('Có lỗi xảy ra khi lưu sản phẩm: ' + ((err as Error)?.message || ''));
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
      fetchProducts();
    } catch {
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải sản phẩm...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6">Danh sách sản phẩm</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sản phẩm..."
          className="px-3 py-2 border rounded w-full sm:w-64"
          value={filter}
          onChange={e => {
            setFilter(e.target.value);
            setPage(1); // Reset về trang đầu khi filter
          }}
        />
        <button
          className="px-4 py-2 bg-[#6F4E37] text-white rounded hover:bg-[#543826]"
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
                <td className="py-3 px-5 font-mono text-sm align-middle">{p.category_id}</td>
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
                    onClick={() => setViewDesc(p.description)}
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

      {/* View Description Modal - render outside table, only once */}
      {viewDesc && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw]">
            <h3 className="text-lg font-bold mb-4">Mô tả sản phẩm</h3>
            <div className="mb-4 whitespace-pre-line break-words">{viewDesc}</div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setViewDesc(null)}
              >Đóng</button>
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
              <label className="block text-sm mb-1">Tên sản phẩm</label>
              <input name="name" value={form.name} onChange={handleInput} className="w-full border px-2 py-1 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Mô tả</label>
              <textarea name="description" value={form.description} onChange={handleInput} className="w-full border px-2 py-1 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Giá</label>
              <input
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
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Category ID</label>
              <input name="category_id" value={form.category_id} onChange={handleInput} className="w-full border px-2 py-1 rounded" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Ảnh (file)</label>
              <input name="image" type="file" accept="image/*" onChange={handleInput} className="w-full border px-2 py-1 rounded" required={!isEdit} />
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
