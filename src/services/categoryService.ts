import axios from "axios";

const API_URL = "http://localhost:3000/api";

export interface Category {
  id: string;
  name: string;
  description: string;
}

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/getCategories`);
    return response.data.data;
  },

  addCategory: async (category: Omit<Category, "id">): Promise<Category> => {
    const response = await axios.post(`${API_URL}/addCategory`, category);
    return response.data.data;
  },

  updateCategory: async (category: Category): Promise<Category> => {
    const response = await axios.put(`${API_URL}/updateCategory`, category);
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/deleteCategory`, { data: { id } });
  },
};
