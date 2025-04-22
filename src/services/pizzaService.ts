import axios from "axios";

const API_URL = "http://localhost:3000/api";

export interface PizzaSize {
  size: "SMALL" | "MEDIUM" | "LARGE";
  price: number;
}

export interface PizzaTopping {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
}

export interface PizzaIngredient {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
}

export interface Pizza {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sizes: Record<string, number>; // { SMALL: price, MEDIUM: price, LARGE: price }
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  defaultToppings: Array<{
    id: string;
    name: string;
    price: string | number;
    quantity: number;
    topping: {
      id: string;
      name: string;
      price: string | number;
    };
  }>;
  defaultIngredients: Array<{
    id: string;
    name: string;
    price: string | number;
    quantity: number;
    ingredient: {
      id: string;
      name: string;
      price: string | number;
    };
  }>;
}

export const pizzaService = {
  getAllPizzas: async (): Promise<Pizza[]> => {
    try {
      const response = await axios.get(`${API_URL}/getAllPizzas`);
      console.log("Raw API response:", response.data);
      const pizzas = response.data.pizzas || [];

      // Process pizzas to ensure sizes is always an object
      const processedPizzas = pizzas.map((pizza) => ({
        ...pizza,
        sizes:
          typeof pizza.sizes === "string"
            ? JSON.parse(pizza.sizes)
            : pizza.sizes,
      }));

      console.log("Processed pizzas:", processedPizzas);
      return processedPizzas;
    } catch (error) {
      console.error("Error in getAllPizzas:", error);
      throw error;
    }
  },

  addPizza: async (pizza: {
    name: string;
    description?: string;
    image?: File;
    category: string;
    sizes: Record<string, number>;
    toppings: Array<{ id: string; quantity: number }>;
    ingredients: Array<{ id: string; quantity: number }>;
  }): Promise<Pizza> => {
    const formData = new FormData();

    // Add text fields
    formData.append("name", pizza.name);
    if (pizza.description) formData.append("description", pizza.description);
    formData.append("category", pizza.category);
    formData.append("sizes", JSON.stringify(pizza.sizes));

    // Add arrays as JSON strings
    if (pizza.toppings && pizza.toppings.length > 0) {
      formData.append("toppings", JSON.stringify(pizza.toppings));
    }

    if (pizza.ingredients && pizza.ingredients.length > 0) {
      formData.append("ingredients", JSON.stringify(pizza.ingredients));
    }

    // Add image file if provided
    if (pizza.image) {
      formData.append("image", pizza.image);
    }

    const response = await axios.post(`${API_URL}/addPizza`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.pizza;
  },

  updatePizza: async (
    pizzaId: string,
    pizza: {
      name: string;
      description?: string;
      image?: File;
      category: string;
      sizes: Record<string, number>;
      toppings: Array<{ id: string; quantity: number }>;
      ingredients: Array<{ id: string; quantity: number }>;
    }
  ): Promise<Pizza> => {
    const formData = new FormData();

    // Add text fields
    formData.append("pizzaId", pizzaId);
    formData.append("name", pizza.name);
    if (pizza.description) formData.append("description", pizza.description);
    formData.append("category", pizza.category);
    formData.append("sizes", JSON.stringify(pizza.sizes));

    // Add arrays as JSON strings
    if (pizza.toppings && pizza.toppings.length > 0) {
      formData.append("toppings", JSON.stringify(pizza.toppings));
    }

    if (pizza.ingredients && pizza.ingredients.length > 0) {
      formData.append("ingredients", JSON.stringify(pizza.ingredients));
    }

    // Add image file if provided
    if (pizza.image) {
      formData.append("image", pizza.image);
    }

    const response = await axios.put(`${API_URL}/updatePizza`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.updatedPizza;
  },

  deletePizza: async (pizzaId: string): Promise<void> => {
    await axios.delete(`${API_URL}/deletePizza`, {
      data: { pizzaId },
    });
  },
};
