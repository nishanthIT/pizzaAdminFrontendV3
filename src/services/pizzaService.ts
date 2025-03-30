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
    const response = await axios.get(`${API_URL}/getAllPizzas`);
    return response.data.pizzas;
  },

  addPizza: async (pizza: {
    name: string;
    description?: string;
    imageUrl?: string;
    category: string;
    sizes: Record<string, number>;
    toppings: Array<{ id: string; quantity: number }>;
    ingredients: Array<{ id: string; quantity: number }>;
  }): Promise<Pizza> => {
    const response = await axios.post(`${API_URL}/addPizza`, pizza);
    return response.data.pizza;
  },

  updatePizza: async (
    pizzaId: string,
    pizza: {
      name: string;
      description?: string;
      imageUrl?: string;
      category: string;
      sizes: Record<string, number>;
      toppings: Array<{ id: string; quantity: number }>;
      ingredients: Array<{ id: string; quantity: number }>;
    }
  ): Promise<Pizza> => {
    const response = await axios.put(`${API_URL}/updatePizza`, {
      pizzaId,
      ...pizza,
    });
    return response.data.updatedPizza;
  },

  deletePizza: async (pizzaId: string): Promise<void> => {
    await axios.delete(`${API_URL}/deletePizza`, {
      data: { pizzaId },
    });
  },
};
