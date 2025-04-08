import { API_URL } from "./config";

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

export const comboService = {
  // Get all pizzas
  async getAllPizzas(): Promise<{ message: string; pizzas: Pizza[] }> {
    try {
      const response = await fetch(`${API_URL}/getAllPizzas`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch pizzas");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching pizzas:", error);
      throw error;
    }
  },

  // Get all combos
  async getAllCombos(): Promise<BackendCombo[]> {
    try {
      const response = await fetch(`${API_URL}/getComboOffer`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch combos");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching combos:", error);
      throw error;
    }
  },

  // Add new combo
  async addCombo(data: ComboFormData, image: File): Promise<BackendCombo> {
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("discount", data.discount.toString());
      formData.append("pizzas", JSON.stringify(data.pizzas));

      const response = await fetch(`${API_URL}/addComboOffer`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add combo");
      }

      return response.json();
    } catch (error) {
      console.error("Error adding combo:", error);
      throw error;
    }
  },

  // Edit combo
  async editCombo(
    id: string,
    data: ComboFormData,
    image?: File
  ): Promise<BackendCombo> {
    try {
      const formData = new FormData();
      if (image) formData.append("image", image);
      formData.append("id", id);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("discount", data.discount.toString());
      formData.append("pizzas", JSON.stringify(data.pizzas));

      const response = await fetch(`${API_URL}/editComboOffer`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to edit combo");
      }

      return response.json();
    } catch (error) {
      console.error("Error editing combo:", error);
      throw error;
    }
  },

  // Delete combo
  async deleteCombo(comboId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/deleteComboOffer`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comboId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete combo");
      }
    } catch (error) {
      console.error("Error deleting combo:", error);
      throw error;
    }
  },
};
