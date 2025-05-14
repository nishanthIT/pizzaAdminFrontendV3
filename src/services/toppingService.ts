import api from "@/services/api";

export interface Topping {
  id: string;
  name: string;
  price: string | number;
  status: boolean;
}

interface ToppingResponse {
  message: string;
  data: Topping | Topping[];
}

export const toppingService = {
  getToppings: async (): Promise<Topping[]> => {
    try {
      const response = await api.get<ToppingResponse>("/getToppings");
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching toppings:", error);
      throw new Error("Failed to fetch toppings");
    }
  },

  addTopping: async (topping: Omit<Topping, "id" | "status">): Promise<Topping> => {
    try {
      const response = await api.post<ToppingResponse>("/addTopping", topping);
      return response.data.data as Topping;
    } catch (error) {
      console.error("Error adding topping:", error);
      throw new Error("Failed to add topping");
    }
  },

  updateTopping: async (topping: Omit<Topping, "status">): Promise<Topping> => {
    try {
      const response = await api.put<ToppingResponse>("/updateTopping", topping);
      return response.data.data as Topping;
    } catch (error) {
      console.error("Error updating topping:", error);
      throw new Error("Failed to update topping");
    }
  },

  updateToppingStatus: async (id: string, status: boolean): Promise<Topping> => {
    try {
      const response = await api.put<ToppingResponse>("/updateStatusTopping", {
        id,
        status,
      });
      return response.data.data as Topping;
    } catch (error) {
      console.error("Error updating topping status:", error);
      throw new Error("Failed to update topping status");
    }
  },

  deleteTopping: async (id: string): Promise<void> => {
    try {
      await api.delete("/deleteTopping", { data: { id } });
    } catch (error) {
      console.error("Error deleting topping:", error);
      throw new Error("Failed to delete topping");
    }
  },
};
