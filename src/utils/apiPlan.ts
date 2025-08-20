export interface Plan {
  planId: number;
  name: string;
  description: string;
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

const AUTH_STORAGE_KEY = 'coffee-admin-auth';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      const token = authData?.token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  return headers;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://minhkhoi02-001-site1.anytempurl.com';

export const planApi = {
  // Get all plans
  getAllPlans: async (): Promise<Plan[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/Plan/get-all-plans`, {
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
      const response = await fetch(`${BASE_URL}/api/Plan/${planId}`, {
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
      console.log('Creating plan with data:', plan);
      console.log('Request URL:', `${BASE_URL}/api/Plan/add-plan`);
      
      const headers = getAuthHeaders();
      console.log('Request headers:', headers);
      
      const response = await fetch(`${BASE_URL}/api/Plan/add-plan`, {
        method: 'POST',
        headers,
        body: JSON.stringify(plan),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Raw response data:', responseData);
      
      // Check if response has data property (API returns {message: '...', data: {...}})
      const planData = responseData.data || responseData;
      console.log('Extracted plan data:', planData);
      return planData;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  },

  // Update plan
  updatePlan: async (planId: number, plan: UpdatePlanRequest): Promise<Plan> => {
    try {
      const response = await fetch(`${BASE_URL}/api/Plan/${planId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(plan),
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
      const response = await fetch(`${BASE_URL}/api/Plan/${planId}`, {
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
      const response = await fetch(`${BASE_URL}/api/Plan/${planId}/toggle-status`, {
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
};

export default planApi;
