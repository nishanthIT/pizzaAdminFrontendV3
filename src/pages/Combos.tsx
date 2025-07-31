import { useState, useEffect } from "react";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { API_IMG_URL, API_URL } from "@/services/config";
import { Loading } from "@/components/ui/loading";

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
    manualPrice?: number;
  }>({
    name: "",
    description: "",
    image: null,
    items: [],
    discount: 0,
    manualPrice: undefined,
  });
  const [pricingMode, setPricingMode] = useState<'percentage' | 'manual'>('percentage');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadCombos();
  }, []);

  const loadCombos = async () => {
    try {
      setIsLoading(true);
      const data = await comboService.getAllCombos();
      console.log("Received combo data:", data);

      const processedCombos = data.map((combo: BackendCombo) => {
        const items = combo.pizzas.map((p) => ({
          id: p.pizzaId, // Update to match the response structure
          name: p.pizza?.name || "", // Add optional chaining
          price: p.pizza?.sizes?.[p.size] || 0,
          quantity: p.quantity,
          size: p.size as PizzaSize,
        }));

        // Calculate actual total price of items
        const actualTotalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Determine if this is manual pricing (discount = 0) or percentage pricing
        const isManualPricing = Number(combo.discount) === 0;
        
        return {
          id: combo.id,
          name: combo.name,
          description: combo.description,
          image: combo.imageUrl, // Use imageUrl directly from the response
          items,
          discount: Number(combo.discount),
          totalPrice: actualTotalPrice, // Always use actual calculated total
          finalPrice: Number(combo.price), // This is either discounted price or manual price
        };
      });

      console.log("Processed combos:", processedCombos);
      setCombos(processedCombos);
    } catch (error) {
      console.error("Error loading combos:", error);
      toast({
        title: "Error",
        description: "Failed to load combos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCombo = async () => {
    try {
      setIsSaving(true);
      setUploadProgress(0);
      
      if (!newCombo.name || newCombo.items.length === 0) {
        toast({
          title: "Error",
          description:
            "Please fill in all required fields and add at least one item",
          variant: "destructive",
        });
        return;
      }

      // Validate pricing based on mode
      if (pricingMode === 'manual' && (!newCombo.manualPrice || newCombo.manualPrice <= 0)) {
        toast({
          title: "Error",
          description: "Please enter a valid manual price",
          variant: "destructive",
        });
        return;
      }

      if (pricingMode === 'percentage' && (newCombo.discount < 0 || newCombo.discount > 100)) {
        toast({
          title: "Error",
          description: "Please enter a valid discount percentage (0-100)",
          variant: "destructive",
        });
        return;
      }

      if (!newCombo.image && !isEditing) {
        toast({
          title: "Error",
          description: "Please select an image for the combo",
          variant: "destructive",
        });
        return;
      }

      const comboData: ComboFormData = {
        name: newCombo.name,
        description: newCombo.description,
        discount: pricingMode === 'percentage' ? newCombo.discount : 0,
        pizzas: newCombo.items.map((item) => ({
          pizzaId: item.id,
          quantity: item.quantity,
          size: item.size,
        })),
        ...(pricingMode === 'manual' && newCombo.manualPrice && {
          manualPrice: newCombo.manualPrice
        })
      };

      console.log("Sending combo data:", {
        isEditing,
        editingComboId,
        comboData,
        pricingMode,
        manualPrice: newCombo.manualPrice,
        hasImage: !!newCombo.image,
      });

      const onProgress = (progress: number) => {
        setUploadProgress(progress);
      };

      if (isEditing && editingComboId) {
        const updatedCombo = await comboService.editCombo(
          editingComboId,
          comboData,
          newCombo.image || undefined,
          onProgress
        );
        console.log("Updated combo response:", updatedCombo);
      } else {
        console.log("Creating new combo with data:", comboData);
        const result = await comboService.addCombo(comboData, newCombo.image, onProgress);
        console.log("Add combo result:", result);
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
      console.error("Full error object:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      let errorMessage = "Failed to save combo";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
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
    console.log("Editing combo:", combo);
    setIsEditing(true);
    setEditingComboId(combo.id);
    
    // Determine pricing mode based on combo data
    // If discount is 0, it's manual pricing
    const isManualPricing = combo.discount === 0;
    setPricingMode(isManualPricing ? 'manual' : 'percentage');
    
    setNewCombo({
      name: combo.name,
      description: combo.description,
      image: null,
      imageUrl: combo.image,
      items: combo.items.map((item) => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),
      discount: Number(combo.discount),
      manualPrice: isManualPricing ? combo.finalPrice : undefined,
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
      manualPrice: undefined,
    });
    setPricingMode('percentage');
    setIsEditing(false);
    setEditingComboId(null);
    setUploadProgress(0);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCombo((prev) => ({ ...prev, image: file }));
    }
  };

  if (isLoading) {
    return <Loading message="Loading combos..." />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Combos & Offers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Combo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="space-y-4 pr-2">
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
                <Label>Pricing Method</Label>
                <RadioGroup 
                  value={pricingMode} 
                  onValueChange={(value: 'percentage' | 'manual') => setPricingMode(value)}
                  className="flex flex-row gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage">Percentage Discount</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual">Manual Price</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {pricingMode === 'percentage' ? (
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
              ) : (
                <div>
                  <Label htmlFor="manualPrice">Manual Price (£)</Label>
                  <Input
                    id="manualPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCombo.manualPrice || ''}
                    onChange={(e) =>
                      setNewCombo((prev) => ({
                        ...prev,
                        manualPrice: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    placeholder="Enter custom price"
                  />
                  {newCombo.items.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Total items value: £{newCombo.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
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
                      className="flex items-center justify-between p-2 border rounded"
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
              <Button onClick={handleAddCombo} className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {uploadProgress > 0 && uploadProgress < 100 
                        ? `Uploading... ${uploadProgress}%`
                        : isEditing ? "Updating..." : "Creating..."
                      }
                    </span>
                  </div>
                ) : (
                  isEditing ? "Update Combo" : "Create Combo"
                )}
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
                src={`${API_IMG_URL}/images/combo-${combo.id}.png`}
                alt={combo.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <CardTitle>{combo.name}</CardTitle>
              <CardDescription>{combo.description}</CardDescription>
              <div className="text-sm text-muted-foreground">
                {combo.discount > 0 
                  ? `${combo.discount}% off - Final Price: £${combo.finalPrice.toFixed(2)}`
                  : `Custom Price: £${combo.finalPrice.toFixed(2)}`
                }
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
                    <span>£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>
                    {combo.discount > 0 ? "Total Before Discount:" : "Items Total:"}
                  </span>
                  <span>£{combo.totalPrice.toFixed(2)}</span>
                </div>
                {combo.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>After {combo.discount}% Discount:</span>
                    <span>£{combo.finalPrice.toFixed(2)}</span>
                  </div>
                )}
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
