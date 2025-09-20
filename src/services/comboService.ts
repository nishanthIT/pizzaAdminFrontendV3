import api from "@/services/api";

export type PizzaSize = "MEDIUM" | "LARGE" | "SUPER_SIZE";

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
  comboItems?: {
    pizzaId?: string;
    otherItemId?: string;
    quantity: number;
    itemType: 'PIZZA' | 'OTHER_ITEM';
    size?: PizzaSize;
  }[];
  // Backward compatibility
  pizzas?: {
    pizzaId: string;
    quantity: number;
    size: PizzaSize;
  }[];
  manualPrice?: number;
};

export type BackendCombo = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  discount: string;
  price: string;
  pizzas?: Array<{
    pizzaId: string;
    pizza: {
      id: string;
      name: string;
      sizes: Record<string, number>;
    };
    size: string;
    quantity: number;
  }>;
  comboItems?: Array<{
    pizzaId?: string;
    otherItemId?: string;
    pizza?: {
      id: string;
      name: string;
      sizes: Record<string, number>;
    };
    otherItem?: {
      id: string;
      name: string;
      price: number;
    };
    size?: string;
    quantity: number;
    itemType: 'PIZZA' | 'OTHER_ITEM';
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
      const response = await api.get("/api/admin/getAllPizzas");
      return response.data;
    } catch (error) {
      console.error("Error fetching pizzas:", error);
      throw new Error("Failed to fetch pizzas");
    }
  },

  // Get all combos
  getAllCombos: async (): Promise<BackendCombo[]> => {
    try {
      const response = await api.get<BackendCombo[]>("/api/admin/getComboOffer");
      console.log("Raw combo response:", response.data);
      // The response is already an array of combos
      return response.data || [];
    } catch (error) {
      console.error("Error fetching combos:", error);
      throw new Error("Failed to fetch combos");
    }
  },

  // Add new combo
  addCombo: async (
    data: ComboFormData, 
    image: File,
    onProgress?: (progress: number) => void
  ): Promise<BackendCombo> => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("discount", data.discount.toString());
      
      // Send data in the new format but maintain backward compatibility
      if (data.comboItems) {
        formData.append("comboItems", JSON.stringify(data.comboItems));
      }
      if (data.pizzas) {
        formData.append("pizzas", JSON.stringify(data.pizzas));
      }
      
      // Add manual price if provided
      if (data.manualPrice !== undefined) {
        formData.append("manualPrice", data.manualPrice.toString());
      }

      console.log("FormData being sent:", {
        name: data.name,
        description: data.description,
        discount: data.discount,
        pizzas: data.pizzas,
        manualPrice: data.manualPrice,
        hasImage: !!image,
        formDataEntries: Array.from(formData.entries())
      });

      const response = await api.post<{ data: BackendCombo }>(
        "/api/admin/addComboOffer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
        }
      );

      console.log("Add combo response:", response.data);
      
      // Handle different response structures
      if (response.data?.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        return response.data as unknown as BackendCombo;
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error adding combo:", error);
      console.error("Error details:", {
        message: error.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      throw error;
    }
  },

  // Edit combo
  editCombo: async (
    id: string,
    data: ComboFormData,
    image?: File,
    onProgress?: (progress: number) => void
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
      
      // Send data in the new format but maintain backward compatibility
      if (data.comboItems) {
        formData.append("comboItems", JSON.stringify(data.comboItems));
      }
      if (data.pizzas) {
        formData.append("pizzas", JSON.stringify(data.pizzas));
      }

      // Add manual price if provided
      if (data.manualPrice !== undefined) {
        formData.append("manualPrice", data.manualPrice.toString());
      }

      console.log("Sending update data:", {
        id,
        data,
        hasImage: !!image,
        formDataEntries: Array.from(formData.entries()),
      });

      // Remove the ID from URL path since backend expects it in the body
      const response = await api.put<{ data: BackendCombo }>(
        "/api/admin/editComboOffer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
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
      await api.delete("/api/admin/deleteComboOffer", {
        data: { comboId },
      });
    } catch (error) {
      console.error("Error deleting combo:", error);
      throw new Error("Failed to delete combo");
    }
  },
};
