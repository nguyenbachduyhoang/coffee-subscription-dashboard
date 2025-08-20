import axios from 'axios';

const AUTH_STORAGE_KEY = 'coffee-admin-auth';

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://minhkhoi02-001-site1.anytempurl.com';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

axiosInstance.interceptors.request.use(request => {
  // improve logging to show full request URL
  console.log('Starting Request:', (request.baseURL || '') + (request.url || ''));
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.token;
      if (token) {
        request.headers = request.headers || {};
        // attach bearer token
        (request.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return request;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // normalize error message
    const msg = error?.response?.data?.message || error?.response?.data || error?.message || 'API error';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
  }
);

export async function login(username: string, password: string): Promise<string> {
  const res = await axiosInstance.post('/api/Staff/login', { email: username, password }, { responseType: 'text' });
  return res.data as string;
}

export async function getAllProducts(): Promise<any[]> {
  const [coffeeRes, teaRes, freezeRes] = await Promise.all([
    axiosInstance.get('/api/Product/get-coffee-product'),
    axiosInstance.get('/api/Product/get-tea-product'),
    axiosInstance.get('/api/Product/get-freeze-product'),
  ]);
  const coffee = coffeeRes.data || [];
  const tea = teaRes.data || [];
  const freeze = freezeRes.data || [];
  return [...coffee, ...tea, ...freeze];
}

export async function addProduct(formData: FormData) {
  return axiosInstance.post('/api/Product/add-product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function updateProduct(formData: FormData) {
  return axiosInstance.put('/api/Product/update-product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function deleteProduct(id: string | number) {
  return axiosInstance.delete(`/api/Product/delete-product/${id}`);
}
