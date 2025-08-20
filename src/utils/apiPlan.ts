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
  productName: string;
  imageUrl: string;
  price: number;
  durationDays: number;
  dailyQuota: number;
  maxPerVisit: number;
  active: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  productName?: string;
  imageUrl?: string;
  price?: number;
  durationDays?: number;
  dailyQuota?: number;
  maxPerVisit?: number;
  active?: boolean;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://minhkhoi02-001-site1.anytempurl.com';

export const planApi = {
  // Get all plans
  getAllPlans: async (): Promise<Plan[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/Plan/get-all-plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${BASE_URL}/api/Plan/add-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error toggling plan status:', error);
      throw error;
    }
  },
};

export default planApi;
