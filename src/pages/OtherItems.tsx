import { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, categoryService } from "@/services/categoryService";
import { OtherItem, otherItemService } from "@/services/otherItemService";
import { API_IMG_URL } from "@/services/config";
import { Loading } from "@/components/ui/loading";

const OtherItems = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<OtherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    image: null as File | null,
    imageUrl: "",
    category: "",
  });
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        otherItemService.getAllOtherItems(),
        categoryService.getCategories(),
      ]);
      setItems(itemsData);
      setAvailableCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (
      !newItem.name ||
      !newItem.description ||
      !newItem.price ||
      !newItem.image ||
      !newItem.category
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload an image",
        variant: "destructive",
      });
      return;
    }

    try {
      const addedItem = await otherItemService.addOtherItem({
        name: newItem.name,
        description: newItem.description,
        price: Number(newItem.price),
        category: newItem.category,
        image: newItem.image,
      });

      setItems([...items, addedItem]);
      toast({
        title: "Success",
        description: "Item added successfully",
      });
      resetItemForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: OtherItem) => {
    setIsEditing(true);
    setEditingItemId(item.id);
    setNewItem({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      image: null,
      imageUrl: item.imageUrl || "",
      category: item.categoryId,
    });
    setIsDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    if (
      !editingItemId ||
      !newItem.name ||
      !newItem.description ||
      !newItem.price ||
      !newItem.category
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedItem = await otherItemService.updateOtherItem({
        id: editingItemId,
        name: newItem.name,
        description: newItem.description,
        price: Number(newItem.price),
        category: newItem.category,
        image: newItem.image || undefined,
      });

      setItems(
        items.map((item) => (item.id === editingItemId ? updatedItem : item))
      );
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      resetItemForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await otherItemService.deleteOtherItem(id);
      setItems(items.filter((item) => item.id !== id));
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const resetItemForm = () => {
    setNewItem({
      name: "",
      description: "",
      price: "",
      image: null,
      imageUrl: "",
      category: "",
    });
    setIsEditing(false);
    setEditingItemId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewItem((prev) => ({ ...prev, image: file }));
    }
  };

  if (isLoading) {
    return <Loading message="Loading items..." />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Other Items</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Item" : "Create New Item"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update this item by changing details."
                  : "Create a new item by filling in the details."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Item Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="price">Item Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) =>
                    setNewItem((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">Item Image</Label>
                {newItem.imageUrl && !newItem.image && (
                  <div className="mb-2">
                    <img
                      src={newItem.imageUrl}
                      alt="Current item preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current image (upload new to replace)
                    </p>
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <Button
                onClick={isEditing ? handleUpdateItem : handleAddItem}
                className="w-full"
              >
                {isEditing ? "Update Item" : "Create Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="flex flex-col h-full">
            <img
              src={`${API_IMG_URL}/images/other-${item.id}.png`}
              alt={item.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-primary">
                ₹{item.price}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEditItem(item)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OtherItems;
