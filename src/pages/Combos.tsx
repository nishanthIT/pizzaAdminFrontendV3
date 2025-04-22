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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ComboItemSelector } from "@/components/combos/ComboItemSelector";
import {
  comboService,
  PizzaSize,
  ComboFormData,
  BackendCombo,
} from "@/services/comboService";
import { API_URL } from "@/services/config";

type ComboItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: PizzaSize;
};

type Combo = {
  id: string;
  name: string;
  description: string;
  image: string;
  items: ComboItem[];
  discount: number;
  totalPrice: number;
  finalPrice: number;
};

const Combos = () => {
  const { toast } = useToast();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  const [newCombo, setNewCombo] = useState<{
    name: string;
    description: string;
    image: string;
    imageUrl?: string;
    items: ComboItem[];
    discount: number;
  }>({
    name: "",
    description: "",
    image: null,
    items: [],
    discount: 0,
  });

  useEffect(() => {
    loadCombos();
  }, []);

  const loadCombos = async () => {
    try {
      const data = await comboService.getAllCombos();
      setCombos(
        data.map((combo: BackendCombo) => ({
          id: combo.id,
          name: combo.name,
          description: combo.description,
          image: `${API_URL}/images/combo-${combo.id}.png`,
          items: combo.pizzas.map((p) => ({
            id: p.pizza.id,
            name: p.pizza.name,
            price: p.pizza.sizes[p.size],
            quantity: p.quantity,
            size: p.size as PizzaSize,
          })),
          discount: Number(combo.discount),
          totalPrice: Number(combo.price) / (1 - Number(combo.discount) / 100),
          finalPrice: Number(combo.price),
        }))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load combos",
        variant: "destructive",
      });
    }
  };

  const handleAddCombo = async () => {
    try {
      if (!newCombo.name || !newCombo.image || newCombo.items.length === 0) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const comboData: ComboFormData = {
        name: newCombo.name,
        description: newCombo.description,
        discount: newCombo.discount,
        pizzas: newCombo.items.map((item) => ({
          pizzaId: item.id,
          quantity: item.quantity,
          size: item.size,
        })),
      };

      console.log("Sending combo data:", comboData);

      if (isEditing && editingComboId) {
        await comboService.editCombo(editingComboId, comboData, newCombo.image);
      } else {
        await comboService.addCombo(comboData, newCombo.image);
      }

      await loadCombos();
      toast({
        title: "Success",
        description: isEditing
          ? "Combo updated successfully"
          : "Combo created successfully",
      });
      resetComboForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving combo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save combo",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = (
    item: { id: string; name: string; price: number; quantity: number },
    size: PizzaSize
  ) => {
    const newItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: size,
    };

    setNewCombo((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setNewCombo((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setNewCombo((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  };

  const handleSizeChange = (id: string, size: PizzaSize) => {
    setNewCombo((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, size } : item
      ),
    }));
  };

  const handleEditCombo = (combo: Combo) => {
    setIsEditing(true);
    setEditingComboId(combo.id);
    setNewCombo({
      name: combo.name,
      description: combo.description,
      image: null,
      imageUrl: combo.image,
      items: combo.items,
      discount: combo.discount,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCombo = async (id: string) => {
    try {
      await comboService.deleteCombo(id);
      await loadCombos();
      toast({
        title: "Success",
        description: "Combo deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete combo",
        variant: "destructive",
      });
    }
  };

  const resetComboForm = () => {
    setNewCombo({
      name: "",
      description: "",
      image: null,
      items: [],
      discount: 0,
    });
    setIsEditing(false);
    setEditingComboId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCombo((prev) => ({ ...prev, image: file }));
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Combos & Offers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Combo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Combo" : "Create New Combo"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update this combo by changing items and settings."
                  : "Create a new combo by selecting items and setting a discount."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Combo Name</Label>
                <Input
                  id="name"
                  value={newCombo.name}
                  onChange={(e) =>
                    setNewCombo((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Combo Description</Label>
                <Textarea
                  id="description"
                  value={newCombo.description}
                  onChange={(e) =>
                    setNewCombo((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="image">Combo Image</Label>
                {newCombo.imageUrl && !newCombo.image && (
                  <div className="mb-2">
                    <img
                      src={newCombo.imageUrl}
                      alt="Current combo preview"
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
              <div>
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={newCombo.discount}
                  onChange={(e) =>
                    setNewCombo((prev) => ({
                      ...prev,
                      discount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-4">
                <Label>Add Items to Combo</Label>
                <ComboItemSelector
                  onAddItem={(item) => handleAddItem(item, "MEDIUM")}
                  showSizeSelector={true}
                  onAddItemWithSize={handleAddItem}
                />
                <div className="space-y-2">
                  {newCombo.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bor
                      
                      
                      
                      r rounded"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500">
                          Size: {item.size}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-20"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddCombo} className="w-full">
                {isEditing ? "Update Combo" : "Create Combo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo) => (
          <Card key={combo.id}>
            <CardHeader>
              <img
                src={`${API_URL}/images/combo-${combo.id}.png`}
                alt={combo.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <CardTitle>{combo.name}</CardTitle>
              <CardDescription>{combo.description}</CardDescription>
              <div className="text-sm text-muted-foreground">
                {combo.discount}% off - Final Price: $
                {combo.finalPrice.toFixed(2)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Items:</p>
                {combo.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} ({item.size}) x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Before Discount:</span>
                  <span>${combo.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEditCombo(combo)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDeleteCombo(combo.id)}
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

export default Combos;
