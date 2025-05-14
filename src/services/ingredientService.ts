import api from "@/services/api";

export interface Ingredient {
  id: string;
  name: string;
  price: string | number;
  status: boolean;
}

interface IngredientResponse {
  message: string;
  data: Ingredient | Ingredient[];
}

export const ingredientService = {
  getIngredients: async (): Promise<Ingredient[]> => {
    try {
      const response = await api.get<IngredientResponse>("/getIngredients");
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      throw new Error("Failed to fetch ingredients");
    }
  },

  addIngredient: async (
    ingredient: Omit<Ingredient, "id" | "status">
  ): Promise<Ingredient> => {
    try {
      const response = await api.post<IngredientResponse>(
        "/addIngredient",
        ingredient
      );
      return response.data.data as Ingredient;
    } catch (error) {
      console.error("Error adding ingredient:", error);
      throw new Error("Failed to add ingredient");
    }
  },

  updateIngredient: async (
    ingredient: Omit<Ingredient, "status">
  ): Promise<Ingredient> => {
    try {
      const response = await api.put<IngredientResponse>(
        "/updateIngredient",
        ingredient
      );
      return response.data.data as Ingredient;
    } catch (error) {
      console.error("Error updating ingredient:", error);
      throw new Error("Failed to update ingredient");
    }
  },

  updateIngredientStatus: async (
    id: string,
    status: boolean
  ): Promise<Ingredient> => {
    try {
      const response = await api.put<IngredientResponse>(
        "/updateStatusIngredient",
        {
          id,
          status,
        }
      );
      return response.data.data as Ingredient;
    } catch (error) {
      console.error("Error updating ingredient status:", error);
      throw new Error("Failed to update ingredient status");
    }
  },

  deleteIngredient: async (id: string): Promise<void> => {
    try {
      await api.delete("/deleteIngredient", { data: { id } });
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      throw new Error("Failed to delete ingredient");
    }
  },
};
