import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  ApiResponse, 
  User, 
  UserResponse, 
  Product, 
  ProductResponse, 
  Category, 
  CategoryResponse, 
  Order, 
  OrderResponse,
  ApiError
} from '../types/api';
import { authStorage } from '../utils/storage';

class ApiService {
  private axiosInstance: AxiosInstance;
  private readonly baseURL: string;

  constructor() {
    // Enhanced base URL logic
    const envBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
    const isHttpsPage = typeof window !== 'undefined' && window.location?.protocol === 'https:';
    const shouldIgnoreEnvBase = !!(envBaseUrl && envBaseUrl.startsWith('http://') && isHttpsPage);
    this.baseURL = shouldIgnoreEnvBase ? '' : (envBaseUrl || '');

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // Increased timeout
      withCredentials: false,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const auth = authStorage.getAuth();
        if (auth?.token) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const apiError = this.handleApiError(error);
        
        // Auto logout on 401
        if (error.response?.status === 401) {
          authStorage.removeAuth();
          window.location.reload();
        }
        
        return Promise.reject(apiError);
      }
    );
  }

  private handleApiError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `HTTP ${error.response.status}: ${error.response.statusText}`;
      return {
        message,
        status: error.response.status,
        code: error.response.data?.code
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Đã xảy ra lỗi không xác định',
        status: 500
      };
    }
  }

  // Generic API methods
  private async get<T>(url: string): Promise<T> {
    const response = await this.axiosInstance.get<T>(url);
    return response.data;
  }

  private async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data);
    return response.data;
  }

  private async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data);
    return response.data;
  }

  private async delete<T>(url: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url);
    return response.data;
  }

  // Auth API
  async login(email: string, password: string): Promise<string> {
    try {
      const response = await this.post<any>('/api/staff/login', { email, password });
      
      // Handle different response formats
      if (typeof response === 'string') {
        return this.normalizeToken(response);
      } else if (response?.token || response?.accessToken || response?.access_token) {
        const token = response.token || response.accessToken || response.access_token;
        return this.normalizeToken(String(token));
      }
      
      throw new Error('Invalid response format from login endpoint');
    } catch (error) {
      throw error;
    }
  }

  private normalizeToken(rawToken: string): string {
    let token = rawToken?.trim() || '';
    
    // Remove quotes if present
    if (token.length >= 2 && 
        ((token.startsWith('"') && token.endsWith('"')) || 
         (token.startsWith("'") && token.endsWith("'")))) {
      token = token.slice(1, -1);
    }
    
    // Remove Bearer prefix if present
    if (token.toLowerCase().startsWith('bearer ')) {
      token = token.slice(7);
    }
    
    return token;
  }

  // Users API
  async getUsers(): Promise<User[]> {
    const response = await this.get<UserResponse[]>('/api/customers');
    return this.mapUsers(response);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const response = await this.post<UserResponse>('/api/customers', userData);
    return this.mapUser(response);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await this.put<UserResponse>(`/api/customers/${id}`, userData);
    return this.mapUser(response);
  }

  async deleteUser(id: string): Promise<void> {
    await this.delete(`/api/customers/${id}`);
  }

  // Products API
  async getProducts(): Promise<Product[]> {
    const [coffees, teas, freezes] = await Promise.all([
      this.get<ProductResponse[]>('/api/products/coffees').catch(() => []),
      this.get<ProductResponse[]>('/api/products/teas').catch(() => []),
      this.get<ProductResponse[]>('/api/products/freezes').catch(() => [])
    ]);
    
    const allProducts = [...coffees, ...teas, ...freezes];
    return this.mapProducts(allProducts);
  }

  async createProduct(formData: FormData): Promise<Product> {
    const response = await this.axiosInstance.post<ProductResponse>('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return this.mapProduct(response.data);
  }

  async updateProduct(formData: FormData): Promise<Product> {
    const response = await this.axiosInstance.put<ProductResponse>('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return this.mapProduct(response.data);
  }

  async deleteProduct(id: string | number): Promise<void> {
    await this.delete(`/api/products/${id}`);
  }

  // Categories API
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.get<CategoryResponse[]>('/api/categories');
      return this.mapCategories(response);
    } catch (error) {
      // Fallback to hardcoded categories
      console.warn('Categories endpoint not available, using fallback data');
      return [
        { category_id: 1, name: 'Cà phê' },
        { category_id: 2, name: 'Trà' },
        { category_id: 3, name: 'Đồ uống đá' },
        { category_id: 4, name: 'Khác' }
      ];
    }
  }

  // Orders API
  async getOrders(): Promise<Order[]> {
    const response = await this.get<OrderResponse[]>('/api/orders');
    return this.mapOrders(response);
  }

  // Data mapping methods
  private mapUser(user: UserResponse): User {
    return {
      id: user.id || user.userId || user.customerId || '',
      name: user.name || user.fullName || user.customerName || '',
      email: user.email || '',
      phone: user.phone || user.phoneNumber || '',
      registeredAt: user.registeredAt || user.createdAt || new Date().toISOString().split('T')[0],
      status: (user.status === 'active' || user.isActive) ? 'active' : 'inactive'
    };
  }

  private mapUsers(users: UserResponse[]): User[] {
    return users.map(user => this.mapUser(user));
  }

  private mapProduct(product: ProductResponse): Product {
    return {
      product_id: product.productId || product.id || product.product_id || 0,
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      image_url: product.image_url || product.imageUrl || product.img || '',
      category_id: this.extractCategoryId(product.category_id || product.categoryID || product.category)
    };
  }

  private mapProducts(products: ProductResponse[]): Product[] {
    return products.map(product => this.mapProduct(product));
  }

  private mapCategory(category: CategoryResponse): Category {
    return {
      category_id: category.category_id || category.categoryID || category.categoryId || category.id || '',
      name: category.name || category.categoryName || category.category || ''
    };
  }

  private mapCategories(categories: CategoryResponse[]): Category[] {
    return categories.map(category => this.mapCategory(category));
  }

  private mapOrder(order: OrderResponse): Order {
    return {
      id: order.id || order.orderId || '',
      userId: order.userId || order.customerId || '',
      userName: order.userName || order.customerName || order.user?.name || '',
      packageName: order.packageName || order.planName || order.package?.name || '',
      total: order.total || order.amount || order.price || 0,
      createdAt: order.createdAt || order.orderDate || new Date().toISOString().split('T')[0],
      status: (order.status as 'pending' | 'completed' | 'cancelled') || 'pending',
      paymentMethod: (order.paymentMethod as 'vnpay' | 'card' | 'other') || 'other'
    };
  }

  private mapOrders(orders: OrderResponse[]): Order[] {
    return orders.map(order => this.mapOrder(order));
  }

  private extractCategoryId(category: any): number | string {
    if (typeof category === 'object' && category !== null && 'id' in category) {
      return category.id;
    }
    return category || '';
  }
}

// Export singleton instance
export const apiService = new ApiService();
