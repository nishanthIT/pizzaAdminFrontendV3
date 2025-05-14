import api from "@/services/api";

export type PizzaSize = "SMALL" | "MEDIUM" | "LARGE";

export type ComboItem = {
  pizzaId: string;
  name: string;
  price: number;
  quantity: number;
  size: PizzaSize;
};

export type ComboFormData = {
  name: string;
  description: string;
  discount: number;
  pizzas: {
    pizzaId: string;
    quantity: number;
    size: PizzaSize;
  }[];
};

export type BackendCombo = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  discount: string;
  price: string;
  pizzas: Array<{
    pizza: {
      id: string;
      name: string;
      sizes: Record<string, number>;
    };
    size: string;
    quantity: number;
  }>;
};

export type Pizza = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  sizes: Record<string, number>;
  categoryId: string;
};

interface ComboResponse {
  message?: string;
  data?: BackendCombo[];
}

export const comboService = {
  // Get all pizzas
  async getAllPizzas(): Promise<{ message: string; pizzas: Pizza[] }> {
    try {
      const response = await api.get("/getAllPizzas");
      return response.data;
    } catch (error) {
      console.error("Error fetching pizzas:", error);
      throw new Error("Failed to fetch pizzas");
    }
  },

  // Get all combos
  getAllCombos: async (): Promise<BackendCombo[]> => {
    try {
      const response = await api.get<BackendCombo[]>("/getComboOffer");
      console.log("Raw combo response:", response.data);
      // The response is already an array of combos
      return response.data || [];
    } catch (error) {
      console.error("Error fetching combos:", error);
      throw new Error("Failed to fetch combos");
    }
  },

  // Add new combo
  addCombo: async (data: ComboFormData, image: File): Promise<BackendCombo> => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("discount", data.discount.toString());
      formData.append("pizzas", JSON.stringify(data.pizzas));

      const response = await api.post<{ data: BackendCombo }>(
        "/addComboOffer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error("Error adding combo:", error);
      throw new Error("Failed to add combo");
    }
  },

  // Edit combo
  editCombo: async (
    id: string,
    data: ComboFormData,
    image?: File
  ): Promise<BackendCombo> => {
    try {
      const formData = new FormData();
      if (image) {
        formData.append("image", image);
      }
      // Add id to both formData and URL params
      formData.append("id", id);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("discount", data.discount.toString());
      formData.append("pizzas", JSON.stringify(data.pizzas));

      console.log("Sending update data:", {
        id,
        data,
        hasImage: !!image,
        formDataEntries: Array.from(formData.entries()),
      });

      // Remove the ID from URL path since backend expects it in the body
      const response = await api.put<{ data: BackendCombo }>(
        "/editComboOffer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data) {
        throw new Error("No data received from server");
      }

      console.log("Update response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error editing combo:", error);
      throw error;
    }
  },

  // Delete combo
  deleteCombo: async (comboId: string): Promise<void> => {
    try {
      await api.delete("/deleteComboOffer", {
        data: { comboId },
      });
    } catch (error) {
      console.error("Error deleting combo:", error);
      throw new Error("Failed to delete combo");
    }
  },
};
