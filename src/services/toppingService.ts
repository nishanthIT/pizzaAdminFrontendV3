import axios from "axios";

const API_URL = "http://localhost:3000/api";

export interface Topping {
  id: string;
  name: string;
  price: string | number;
  status: boolean;
}

export const toppingService = {
  getToppings: async (): Promise<Topping[]> => {
    const response = await axios.get(`${API_URL}/getToppings`);
    return response.data.data;
  },

  addTopping: async (
    topping: Omit<Topping, "id" | "status">
  ): Promise<Topping> => {
    const response = await axios.post(`${API_URL}/addTopping`, topping);
    return response.data.data;
  },

  updateTopping: async (topping: Omit<Topping, "status">): Promise<Topping> => {
    const response = await axios.put(`${API_URL}/updateTopping`, topping);
    return response.data.data;
  },

  updateToppingStatus: async (
    id: string,
    status: boolean
  ): Promise<Topping> => {
    const response = await axios.put(`${API_URL}/updateStatusTopping`, {
      id,
      status,
    });
    return response.data.data;
  },

  deleteTopping: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/deleteTopping`, { data: { id } });
  },
};
