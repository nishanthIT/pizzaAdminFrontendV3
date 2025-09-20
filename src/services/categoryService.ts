import api from "@/services/api";

export interface Category {
  id: string;
  name: string;
  description: string;
}

interface CategoryResponse {
  message: string;
  data: Category[];
}

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<CategoryResponse>("/api/admin/getCategories");
      // Access the data property from the response
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  },

  addCategory: async (category: Omit<Category, "id">): Promise<Category> => {
    try {
      const response = await api.post("/api/admin/addCategory", category);
      return response.data;
    } catch (error) {
      console.error("Error adding category:", error);
      throw new Error("Failed to add category");
    }
  },

  updateCategory: async (category: Category): Promise<Category> => {
    try {
      const response = await api.put("/api/admin/updateCategory", category);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Failed to update category");
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await api.delete("/api/admin/deleteCategory", { data: { id } });
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new Error("Failed to delete category");
    }
  },
};
