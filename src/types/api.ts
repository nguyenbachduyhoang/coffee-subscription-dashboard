// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User/Customer Types
export interface UserResponse {
  id: string;
  customerId?: string;
  userId?: string;
  name?: string;
  fullName?: string;
  customerName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  registeredAt?: string;
  createdAt?: string;
  status?: string;
  isActive?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  status: 'active' | 'inactive';
}

// Product Types
export interface ProductResponse {
  productId?: number;
  id?: number;
  product_id?: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  imageUrl?: string;
  img?: string;
  category_id?: number | string;
  categoryID?: number | string;
  category?: number | string | { id: number | string };
}

export interface Product {
  product_id: number | string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number | string;
}

// Category Types
export interface CategoryResponse {
  category_id?: number | string;
  categoryID?: number | string;
  categoryId?: number | string;
  id?: number | string;
  name?: string;
  categoryName?: string;
  category?: string;
}

export interface Category {
  category_id: number | string;
  name: string;
}

// Order Types
export interface OrderResponse {
  id?: string;
  orderId?: string;
  userId?: string;
  customerId?: string;
  userName?: string;
  customerName?: string;
  user?: { name: string };
  packageName?: string;
  planName?: string;
  package?: { name: string };
  total?: number;
  amount?: number;
  price?: number;
  createdAt?: string;
  orderDate?: string;
  status?: string;
  paymentMethod?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  packageName: string;
  total: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'vnpay' | 'card' | 'other';
}

// Auth Types
export interface LoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
}

export interface AuthData {
  user: {
    username: string;
    role: string;
  };
  token: string;
  expiresAt: number;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
