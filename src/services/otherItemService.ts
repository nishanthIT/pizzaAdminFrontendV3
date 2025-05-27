import api from "@/services/api";

export interface OtherItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

export const otherItemService = {
  async getAllOtherItems(): Promise<OtherItem[]> {
    try {
      const response = await api.get<OtherItem[]>("/getAllOtherItems");
      console.log("Raw other items response:", response.data);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching other items:", error);
      throw new Error("Failed to fetch other items");
    }
  },

  async addOtherItem(data: {
    name: string;
    description: string;
    price: number;
    category: string;
    image: File;
  }): Promise<OtherItem> {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("image", data.image);

      const response = await api.post<{ data: OtherItem }>(
        "/addOtherItem",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error("Error adding other item:", error);
      throw new Error("Failed to add other item");
    }
  },

  async updateOtherItem(data: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: File;
  }): Promise<OtherItem> {
    try {
      const formData = new FormData();
      formData.append("id", data.id);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      if (data.image) {
        formData.append("image", data.image);
      }

      console.log("Sending update data:", {
        id: data.id,
        data,
        hasImage: !!data.image,
        formDataEntries: Array.from(formData.entries()),
      });

      const response = await api.put<OtherItem>("/updateOtherItem", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      console.log("Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating other item:", error);
      throw error;
    }
  },

  async deleteOtherItem(id: string): Promise<void> {
    try {
      await api.delete(`/deleteOtherItem/${id}`);
    } catch (error) {
      console.error("Error deleting other item:", error);
      throw new Error("Failed to delete other item");
    }
  },
};
