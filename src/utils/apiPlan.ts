export interface Plan {
  planId: number;
  name: string;
  description: string;
  // Optional: some endpoints may return productId alongside productName
  productId?: number;
  productName: string;
  imageUrl: string;
  price: number;
  durationDays: number;
  dailyQuota: number;
  maxPerVisit: number;
  active: boolean;
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  productId: number;
  price: number;
  durationDays: number;
  dailyQuota: number;
  maxPerVisit: number;
  active: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  productId?: number;
  imageUrl?: string;
  price?: number;
  durationDays?: number;
  dailyQuota?: number;
  maxPerVisit?: number;
  active?: boolean;
}

export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
}

const AUTH_STORAGE_KEY = 'coffee-admin-auth'; // Match storage service prefix + key

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    
    if (storedAuth) {
      const authStorageData = JSON.parse(storedAuth);
      
      // Enhanced storage service wraps data in {value: ..., timestamp: ..., expiresAt: ...}
      const authData = authStorageData.value || authStorageData;
      
      console.log('🔐 Auth Debug:', { 
        rawStorage: authStorageData, 
        extractedAuth: authData,
        token: authData?.token 
      });
      
      let token: string = String(authData?.token || '').trim();
      
      if (token) {
        // Normalize accidental quotes
        if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
          token = token.slice(1, -1);
        }
        const hasBearer = token.toLowerCase().startsWith('bearer ');
        const finalAuth = hasBearer ? token : `Bearer ${token}`;
        headers['Authorization'] = finalAuth;
        
        console.log('✅ Auth Header Set:', finalAuth.substring(0, 20) + '...');
      } else {
        console.warn('⚠️ No token found in auth data');
      }
    } else {
      console.warn('⚠️ No auth data in localStorage');
    }
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
  }

  return headers;
};

// In production over HTTPS, ignore an http:// env base to avoid mixed content
const envBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const isHttpsPage = typeof window !== 'undefined' && window.location?.protocol === 'https:';
const shouldIgnoreEnvBase = !!(envBaseUrl && envBaseUrl.startsWith('http://') && isHttpsPage);
const BASE_URL = shouldIgnoreEnvBase ? '' : (envBaseUrl || '');

export const planApi = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/products`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      // Handle both direct array and wrapped response
      const products = responseData.data || responseData;
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get all plans
  getAllPlans: async (): Promise<Plan[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/plans`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      // Handle both direct array and wrapped response
      const plans = responseData.data || responseData;
      return Array.isArray(plans) ? plans : [];
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  },

  // Get plan by ID
  getPlanById: async (planId: number): Promise<Plan> => {
    try {
      const response = await fetch(`${BASE_URL}/api/plans/${planId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  },

  // Create new plan
  createPlan: async (plan: CreatePlanRequest): Promise<Plan> => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/plans`, {
        method: 'POST',
        headers,
        body: JSON.stringify(plan),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseData = await response.json();
      // Check if response has data property (API returns {message: '...', data: {...}})
      const planData = responseData.data || responseData;
      return planData;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  },

  // Update plan
  updatePlan: async (planId: number, plan: UpdatePlanRequest): Promise<Plan> => {
    try {
      // Update plan - ID goes as query parameter, plan data in body
      const url = `${BASE_URL}/api/plans?id=${planId}`;
      const body = plan;
      
      console.log('🔄 Update Plan Request:', { url, method: 'PUT', planId, body });
      const headers = getAuthHeaders();
      headers['Accept'] = 'application/json';
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      // Handle both direct data and wrapped response
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  },

  // Delete plan
  deletePlan: async (planId: number): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/api/plans/${planId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  },

  // Toggle plan status
  togglePlanStatus: async (planId: number): Promise<Plan> => {
    try {
      const response = await fetch(`${BASE_URL}/api/plans/${planId}/deactivate`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      // Handle both direct data and wrapped response
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error toggling plan status:', error);
      throw error;
    }
  },

  // Unactive plan
  unactivePlan: async (planId: number): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/api/plans/${planId}/deactivate`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error unactivating plan:', error);
      throw error;
    }
  },
};

export default planApi;
