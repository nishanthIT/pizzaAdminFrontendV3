import axios from "axios";

const API_URL = "http://localhost:3000/api";

export interface Ingredient {
  id: string;
  name: string;
  price: string | number; // Handle both string and number for Prisma Decimal
  status: boolean;
}

export const ingredientService = {
  getIngredients: async (): Promise<Ingredient[]> => {
    const response = await axios.get(`${API_URL}/getIngredients`);
    return response.data.data;
  },

  addIngredient: async (
    ingredient: Omit<Ingredient, "id" | "status">
  ): Promise<Ingredient> => {
    const response = await axios.post(`${API_URL}/addIngredient`, ingredient);
    return response.data.data;
  },

  updateIngredient: async (
    ingredient: Omit<Ingredient, "status">
  ): Promise<Ingredient> => {
    const response = await axios.put(`${API_URL}/updateIngredient`, ingredient);
    return response.data.data;
  },

  updateIngredientStatus: async (
    id: string,
    status: boolean
  ): Promise<Ingredient> => {
    const response = await axios.put(`${API_URL}/updateStatusIngredient`, {
      id,
      status,
    });
    return response.data.data;
  },

  deleteIngredient: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/deleteIngredient`, { data: { id } });
  },
};
