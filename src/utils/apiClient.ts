import axios from 'axios';

const AUTH_STORAGE_KEY = 'coffee-admin-auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://minhkhoi02-001-site1.anytempurl.com';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    // Do not set global Content-Type so axios can set JSON or multipart automatically per request
    'Accept': 'application/json'
  }
});

axiosInstance.interceptors.request.use(request => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.token;
      if (token) {
        request.headers = request.headers || {};
        (request.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch {}
  return request;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // handle unauthorized → clear auth so user can login again
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {}
    }
    // normalize error message
    const msg = error?.response?.data?.message || error?.response?.data || error?.message || 'API error';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
  }
);

function normalizeToken(rawToken: string): string {
  let token = rawToken?.trim() || '';
  if (token.length >= 2 && ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'")))) {
    token = token.slice(1, -1);
  }
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7);
  }
  return token;
}

export async function login(username: string, password: string): Promise<string> {
  const res = await axiosInstance.post('/api/Staff/login', { email: username, password }, { responseType: 'text' });
  let tokenCandidate: any = res.data;
  if (typeof tokenCandidate === 'string') {
    tokenCandidate = normalizeToken(tokenCandidate);
  } else if (tokenCandidate && typeof tokenCandidate === 'object') {
    const possible = tokenCandidate.token || tokenCandidate.accessToken || tokenCandidate.access_token;
    tokenCandidate = normalizeToken(String(possible || ''));
  }
  return String(tokenCandidate || '');
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
  // Do not set Content-Type; let the browser add proper multipart boundary
  return axiosInstance.post('/api/Product/add-product', formData);
}

export async function getAllCategories(): Promise<Array<{ category_id: number | string; name: string }>> {
  const res = await axiosInstance.get('/api/Category/get-all-category');
  const raw = (res.data as any[]) || [];
  return raw.map((c: any, index: number) => ({
    category_id: c?.category_id ?? c?.categoryID ?? c?.categoryId ?? c?.id ?? String(index + 1),
    name: c?.name ?? c?.categoryName ?? c?.category ?? `Danh mục ${index + 1}`,
  }));
}

export async function updateProduct(formData: FormData) {
  return axiosInstance.put('/api/Product/update-product', formData);
}

export async function deleteProduct(id: string | number) {
  const numericId = Number(String(id).trim());
  return axiosInstance.delete(`/api/Product/delete-product/${Number.isFinite(numericId) ? numericId : id}`);
}
