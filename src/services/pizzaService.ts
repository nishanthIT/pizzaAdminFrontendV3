import api from "@/services/api";

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
  description: string | null;
  imageUrl: string | null;
  sizes: {
    SMALL: number;
    MEDIUM: number;
    LARGE: number;
  };
  categoryId: string;
  defaultToppings: Array<{
    topping: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  defaultIngredients: Array<{
    ingredient: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
}

interface PizzaResponse {
  message: string;
  pizzas: Pizza[];
}

export const pizzaService = {
  getAllPizzas: async (): Promise<Pizza[]> => {
    try {
      const response = await api.get<PizzaResponse>("/getAllPizzas");
      console.log("Raw API response:", response.data);

      // Access pizzas array from response and parse sizes
      const pizzas = response.data.pizzas.map((pizza) => ({
        ...pizza,
        // Parse the sizes string if it's a string
        sizes:
          typeof pizza.sizes === "string"
            ? JSON.parse(pizza.sizes)
            : pizza.sizes,
      }));

      console.log("Processed pizzas:", pizzas);
      return pizzas;
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
    if (pizza.toppings?.length > 0) {
      formData.append("toppings", JSON.stringify(pizza.toppings));
    }

    if (pizza.ingredients?.length > 0) {
      formData.append("ingredients", JSON.stringify(pizza.ingredients));
    }

    // Add image file if provided
    if (pizza.image) {
      formData.append("image", pizza.image);
    }

    const response = await api.post("/addPizza", formData, {
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
    if (pizza.toppings?.length > 0) {
      formData.append("toppings", JSON.stringify(pizza.toppings));
    }

    if (pizza.ingredients?.length > 0) {
      formData.append("ingredients", JSON.stringify(pizza.ingredients));
    }

    // Add image file if provided
    if (pizza.image) {
      formData.append("image", pizza.image);
    }

    const response = await api.put("/updatePizza", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.updatedPizza;
  },

  deletePizza: async (pizzaId: string): Promise<void> => {
    await api.delete("/deletePizza", {
      data: { pizzaId },
    });
  },
};
