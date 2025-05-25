import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Plus,
  PizzaIcon,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  Pizza,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pizza, pizzaService } from "@/services/pizzaService";
import { Category, categoryService } from "@/services/categoryService";
import { Topping, toppingService } from "@/services/toppingService";
import { Ingredient, ingredientService } from "@/services/ingredientService";
import { API_IMG_URL, API_URL } from "@/services/config";
import { Loading } from "@/components/ui/loading";

interface PizzaTopping {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PizzaIngredient {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PizzaSize {
  size: "small" | "medium" | "large";
  price: number;
}

interface PizzaItem {
  id: number;
  name: string;
  sizes: PizzaSize[];
  category: string;
  imageUrl: string;
  toppings: PizzaTopping[];
  ingredients: PizzaIngredient[];
}

const Pizzas = () => {
  const { toast } = useToast();
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);

  // Available items states
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );
  const [availableToppings, setAvailableToppings] = useState<Topping[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [smallPrice, setSmallPrice] = useState("");
  const [mediumPrice, setMediumPrice] = useState("");
  const [largePrice, setLargePrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [Loading, setLoading] = useState(false);
  
  const [selectedToppings, setSelectedToppings] = useState<PizzaTopping[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    PizzaIngredient[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [pizzasData, categoriesData, toppingsData, ingredientsData] =
        await Promise.all([
          pizzaService.getAllPizzas(),
          categoryService.getCategories(),
          toppingService.getToppings(),
          ingredientService.getIngredients(),
        ]);

      console.log("Raw pizzas data:", pizzasData);
      console.log("Sample pizza sizes:", pizzasData[0]?.sizes);

      setPizzas(pizzasData);
      setAvailableCategories(categoriesData);
      setAvailableToppings(toppingsData);
      setAvailableIngredients(ingredientsData);
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

  const handleAddNew = () => {
    setEditingPizza(null);
    setName("");
    setSmallPrice("");
    setMediumPrice("");
    setLargePrice("");
    setCategory("");
    setImageUrl("");
    setSelectedToppings([]);
    setSelectedIngredients([]);
    setIsDialogOpen(true);
    setDescription("")
  };

  const handleEdit = (pizza: Pizza) => {
    setEditingPizza(pizza);
    setName(pizza.name);
    setDescription(pizza.description || "");
    setSmallPrice(pizza.sizes.SMALL.toString());
    setMediumPrice(pizza.sizes.MEDIUM.toString());
    setLargePrice(pizza.sizes.LARGE.toString());
    setCategory(pizza.categoryId);
    setImageUrl(pizza.imageUrl || "");

    setSelectedToppings(
      pizza.defaultToppings.map((t) => ({
        id: t.topping.id,
        name: t.topping.name,
        price: parseFloat(t.topping.price.toString()),
        quantity: t.quantity,
      }))
    );

    setSelectedIngredients(
      pizza.defaultIngredients.map((i) => ({
        id: i.ingredient.id,
        name: i.ingredient.name,
        price: parseFloat(i.ingredient.price.toString()),
        quantity: i.quantity,
      }))
    );

    setIsDialogOpen(true);
  };

  const handleDelete = async (pizza: Pizza) => {
    try {
      await pizzaService.deletePizza(pizza.id);
      setPizzas(pizzas.filter((p) => p.id !== pizza.id));
      toast({
        title: "Success",
        description: "Pizza deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete pizza",
        variant: "destructive",
      });
    }
  };

  const handleAddTopping = (topping: Topping) => {
    const existingTopping = selectedToppings.find((t) => t.id === topping.id);
    if (existingTopping) {
      setSelectedToppings(
        selectedToppings.map((t) =>
          t.id === topping.id ? { ...t, quantity: t.quantity + 1 } : t
        )
      );
    } else {
      setSelectedToppings([
        ...selectedToppings,
        {
          id: topping.id,
          name: topping.name,
          price: parseFloat(topping.price.toString()),
          quantity: 1,
        },
      ]);
    }
  };

  const handleAddIngredient = (ingredient: Ingredient) => {
    const existingIngredient = selectedIngredients.find(
      (i) => i.id === ingredient.id
    );
    if (existingIngredient) {
      setSelectedIngredients(
        selectedIngredients.map((i) =>
          i.id === ingredient.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedIngredients([
        ...selectedIngredients,
        {
          id: ingredient.id,
          name: ingredient.name,
          price: parseFloat(ingredient.price.toString()),
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveTopping = (toppingId: string) => {
    setSelectedToppings(selectedToppings.filter((t) => t.id !== toppingId));
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setSelectedIngredients(
      selectedIngredients.filter((i) => i.id !== ingredientId)
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    if (!name || !smallPrice || !mediumPrice || !largePrice || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const sizes = {
      SMALL: parseFloat(smallPrice),
      MEDIUM: parseFloat(mediumPrice),
      LARGE: parseFloat(largePrice),
    };

    try {
      if (editingPizza) {
        await pizzaService.updatePizza(editingPizza.id, {
          name,
          description,
          image: selectedFile || undefined,
          category,
          sizes,
          toppings: selectedToppings.map((t) => ({
            id: t.id,
            quantity: t.quantity,
          })),
          ingredients: selectedIngredients.map((i) => ({
            id: i.id,
            quantity: i.quantity,
          })),
        });
        toast({
          title: "Success",
          description: "Pizza updated successfully",
        });
      } else {
        await pizzaService.addPizza({
          name,
          description,
          image: selectedFile || undefined,
          category,
          sizes,
          toppings: selectedToppings.map((t) => ({
            id: t.id,
            quantity: t.quantity,
          })),
          ingredients: selectedIngredients.map((i) => ({
            id: i.id,
            quantity: i.quantity,
          })),
        });
        
        toast({
          title: "Success",
          description: "Pizza added successfully",
        });
      }
      fetchInitialData(); // Refresh the list
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pizza",
        variant: "destructive",
      });

    }
    setLoading(false);
  };

  const incrementToppingQuantity = (toppingId: string) => {
    setSelectedToppings(
      selectedToppings.map((topping) =>
        topping.id === toppingId
          ? { ...topping, quantity: topping.quantity + 1 }
          : topping
      )
    );
  };

  const decrementToppingQuantity = (toppingId: string) => {
    setSelectedToppings(
      selectedToppings.map((topping) =>
        topping.id === toppingId && topping.quantity > 1
          ? { ...topping, quantity: topping.quantity - 1 }
          : topping
      )
    );
  };

  const incrementIngredientQuantity = (ingredientId: string) => {
    setSelectedIngredients(
      selectedIngredients.map((ingredient) =>
        ingredient.id === ingredientId
          ? { ...ingredient, quantity: ingredient.quantity + 1 }
          : ingredient
      )
    );
  };

  const decrementIngredientQuantity = (ingredientId: string) => {
    setSelectedIngredients(
      selectedIngredients.map((ingredient) =>
        ingredient.id === ingredientId && ingredient.quantity > 1
          ? { ...ingredient, quantity: ingredient.quantity - 1 }
          : ingredient
      )
    );
  };

  if (isLoading) {
    // return <Loading message="Loading pizzas..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Pizza Management</CardTitle>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Pizza
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Small (£)</TableHead>
                <TableHead>Medium (£)</TableHead>
                <TableHead>Large (£)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pizzas.map((pizza) => (
                <TableRow key={pizza.id}>
                  <TableCell>
                    <img
                      src={`${API_IMG_URL}/images/pizza-${
                        pizza.id
                      }.png?v=${Math.random()}`}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell>{pizza.name}</TableCell>
                  <TableCell>
                    {availableCategories.find(
                      (cat) => cat.id === pizza.categoryId
                    )?.name || pizza.categoryId}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      console.log(
                        "Pizza sizes for",
                        pizza.name,
                        ":",
                        pizza.sizes
                      );
                      return `£${Number(pizza.sizes?.SMALL || 0).toFixed(2)}`;
                    })()}
                  </TableCell>
                  <TableCell>
                    £{Number(pizza.sizes?.MEDIUM || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    £{Number(pizza.sizes?.LARGE || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pizza)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pizza)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>
              {editingPizza ? "Edit Pizza" : "Add New Pizza"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pizza-name">Pizza Name</Label>
                <Input
                  id="pizza-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Margherita"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="small-price">Small Size Price (£)</Label>
                  <Input
                    id="small-price"
                    type="number"
                    step="1"
                    min="0"
                    value={smallPrice}
                    onChange={(e) => setSmallPrice(e.target.value)}
                    placeholder="e.g., 9.99"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medium-price">Medium Size Price (£)</Label>
                  <Input
                    id="medium-price"
                    type="number"
                    step="1"
                    min="0"
                    value={mediumPrice}
                    onChange={(e) => setMediumPrice(e.target.value)}
                    placeholder="e.g., 12.99"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="large-price">Large Size Price (£)</Label>
                  <Input
                    id="large-price"
                    type="number"
                    step="1"
                    min="0"
                    value={largePrice}
                    onChange={(e) => setLargePrice(e.target.value)}
                    placeholder="e.g., 15.99"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Classic pizza with tomato sauce and cheese"
                />
              </div>
         
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
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
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {imageUrl && (
                  <img
                    src={`${API_URL}/images/pizza-${editingPizza?.id}.png`}
                    alt={editingPizza?.name}
                    className="mt-2 w-full h-32 object-cover rounded-md"
                  />
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Toppings</h3>
                <div className="space-y-2">
                  {availableToppings.map((topping) => (
                    <Button
                      key={topping.id}
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleAddTopping(topping)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {topping.name}
                    </Button>
                  ))}
                </div>
                <div className="mt-2">
                  {selectedToppings.map((topping) => (
                    <div
                      key={topping.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2"
                    >
                      <span>{topping.name}</span>
                      <div className="flex items-center">
                        <div className="flex items-center mr-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => decrementToppingQuantity(topping.id)}
                            disabled={topping.quantity <= 1}
                          >
                            <ArrowDown className="h-4 w-4 text-gray-500" />
                          </Button>
                          <span className="mx-2 min-w-[24px] text-center">
                            {topping.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => incrementToppingQuantity(topping.id)}
                          >
                            <ArrowUp className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTopping(topping.id)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <div className="space-y-2">
                  {availableIngredients.map((ingredient) => (
                    <Button
                      key={ingredient.id}
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleAddIngredient(ingredient)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {ingredient.name}
                    </Button>
                  ))}
                </div>
                <div className="mt-2">
                  {selectedIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2"
                    >
                      <span>{ingredient.name}</span>
                      <div className="flex items-center">
                        <div className="flex items-center mr-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              decrementIngredientQuantity(ingredient.id)
                            }
                            disabled={ingredient.quantity <= 1}
                          >
                            <ArrowDown className="h-4 w-4 text-gray-500" />
                          </Button>
                          <span className="mx-2 min-w-[24px] text-center">
                            {ingredient.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              incrementIngredientQuantity(ingredient.id)
                            }
                          >
                            <ArrowUp className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveIngredient(ingredient.id)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
           <Button onClick={handleSave} disabled={isLoading}>
  {isLoading ? "Loading..." : editingPizza ? "Update Pizza" : "Add Pizza"}
</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pizzas;
