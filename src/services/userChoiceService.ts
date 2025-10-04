import api from "@/services/api";

export interface UserChoice {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayCategoryId: string;
  displayCategory?: {
    id: string;
    name: string;
  };
  basePrice: string; // Prisma Decimal comes as string from API
  categoryConfigs: CategoryConfig[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryConfig {
  categoryId: string;
  categoryName: string;
  itemCount: number;
  allowedSize?: string; // Single size for pizza categories (e.g., "medium", "large", "super_size")
  type: 'pizza' | 'other';
}

interface UserChoiceResponse {
  success: boolean;
  message?: string;
  data: UserChoice | UserChoice[];
}

interface CategoryItemsResponse {
  success: boolean;
  data: any[];
}

export const userChoiceService = {
  // Get all user choices
  getAll: async (): Promise<UserChoiceResponse> => {
    try {
      const response = await api.get<UserChoiceResponse>("/api/admin/userChoices");
      return response.data;
    } catch (error) {
      console.error("Error fetching user choices:", error);
      throw new Error("Failed to fetch user choices");
    }
  },

  // Get user choice by ID
  getById: async (id: string): Promise<UserChoiceResponse> => {
    try {
      const response = await api.get<UserChoiceResponse>(`/api/admin/userChoices/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user choice:", error);
      throw new Error("Failed to fetch user choice");
    }
  },

  // Create new user choice
  create: async (data: FormData): Promise<UserChoiceResponse> => {
    try {
      const response = await api.post<UserChoiceResponse>("/api/admin/userChoices", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating user choice:", error);
      throw new Error("Failed to create user choice");
    }
  },

  // Update user choice
  update: async (id: string, data: FormData): Promise<UserChoiceResponse> => {
    try {
      const response = await api.put<UserChoiceResponse>(`/api/admin/userChoices/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user choice:", error);
      throw new Error("Failed to update user choice");
    }
  },

  // Delete user choice
  delete: async (id: string): Promise<UserChoiceResponse> => {
    try {
      const response = await api.delete<UserChoiceResponse>(`/api/admin/userChoices/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user choice:", error);
      throw new Error("Failed to delete user choice");
    }
  },

  // Get items for a specific category
  getCategoryItems: async (categoryId: string, type: 'pizza' | 'other'): Promise<CategoryItemsResponse> => {
    try {
      const response = await api.get<CategoryItemsResponse>(
        `/api/admin/userChoices/category-items?categoryId=${categoryId}&type=${type}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching category items:", error);
      throw new Error("Failed to fetch category items");
    }
  }
};