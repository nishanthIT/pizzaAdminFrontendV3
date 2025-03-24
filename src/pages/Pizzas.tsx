
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Pizza, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PizzaTopping {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface PizzaIngredient {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface PizzaSize {
  size: 'small' | 'medium' | 'large';
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
  const [pizzas, setPizzas] = useState<PizzaItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState<PizzaItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [smallPrice, setSmallPrice] = useState("");
  const [mediumPrice, setMediumPrice] = useState("");
  const [largePrice, setLargePrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedToppings, setSelectedToppings] = useState<PizzaTopping[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<PizzaIngredient[]>([]);

  // Sample data for toppings and ingredients (you should fetch these from your existing state)
  const availableToppings = [
    { id: 1, name: "Pepperoni", price: 1.99, quantity: 1 },
    { id: 2, name: "Mushrooms", price: 1.50, quantity: 1 },
  ];

  const availableIngredients = [
    { id: 1, name: "Flour", price: 2.99, quantity: 1 },
    { id: 2, name: "Tomato Sauce", price: 3.50, quantity: 1 },
  ];

  const categories = [
    { value: "veg", label: "Vegetarian" },
    { value: "non-veg", label: "Non-Vegetarian" },
    { value: "spicy", label: "Spicy" },
    { value: "specialty", label: "Specialty" },
  ];

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
  };

  const handleEdit = (pizza: PizzaItem) => {
    setEditingPizza(pizza);
    setName(pizza.name);
    
    // Set size prices
    const smallSize = pizza.sizes.find(s => s.size === 'small');
    const mediumSize = pizza.sizes.find(s => s.size === 'medium');
    const largeSize = pizza.sizes.find(s => s.size === 'large');
    
    setSmallPrice(smallSize ? smallSize.price.toString() : "");
    setMediumPrice(mediumSize ? mediumSize.price.toString() : "");
    setLargePrice(largeSize ? largeSize.price.toString() : "");
    
    setCategory(pizza.category);
    setImageUrl(pizza.imageUrl);
    setSelectedToppings(pizza.toppings);
    setSelectedIngredients(pizza.ingredients);
    setIsDialogOpen(true);
  };

  const handleDelete = (pizza: PizzaItem) => {
    setPizzas(pizzas.filter(p => p.id !== pizza.id));
    toast({
      title: "Pizza Deleted",
      description: `${pizza.name} has been deleted successfully.`
    });
  };

  const handleAddTopping = (topping: PizzaTopping) => {
    const existingTopping = selectedToppings.find(t => t.id === topping.id);
    if (existingTopping) {
      setSelectedToppings(selectedToppings.map(t =>
        t.id === topping.id ? { ...t, quantity: t.quantity + 1 } : t
      ));
    } else {
      setSelectedToppings([...selectedToppings, { ...topping, quantity: 1 }]);
    }
  };

  const handleAddIngredient = (ingredient: PizzaIngredient) => {
    const existingIngredient = selectedIngredients.find(i => i.id === ingredient.id);
    if (existingIngredient) {
      setSelectedIngredients(selectedIngredients.map(i =>
        i.id === ingredient.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedIngredients([...selectedIngredients, { ...ingredient, quantity: 1 }]);
    }
  };

  const handleRemoveTopping = (toppingId: number) => {
    setSelectedToppings(selectedToppings.filter(t => t.id !== toppingId));
  };

  const handleRemoveIngredient = (ingredientId: number) => {
    setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredientId));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name || !smallPrice || !mediumPrice || !largePrice || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const small = parseFloat(smallPrice);
    const medium = parseFloat(mediumPrice);
    const large = parseFloat(largePrice);
    
    if (isNaN(small) || isNaN(medium) || isNaN(large)) {
      toast({
        title: "Error",
        description: "Please enter valid prices",
        variant: "destructive"
      });
      return;
    }

    const sizes: PizzaSize[] = [
      { size: 'small', price: small },
      { size: 'medium', price: medium },
      { size: 'large', price: large }
    ];

    if (editingPizza) {
      setPizzas(pizzas.map(p =>
        p.id === editingPizza.id
          ? {
              ...p,
              name,
              sizes,
              category,
              imageUrl,
              toppings: selectedToppings,
              ingredients: selectedIngredients,
            }
          : p
      ));
      toast({
        title: "Pizza Updated",
        description: `${name} has been updated successfully.`
      });
    } else {
      const newPizza: PizzaItem = {
        id: Math.max(0, ...pizzas.map(p => p.id)) + 1,
        name,
        sizes,
        category,
        imageUrl,
        toppings: selectedToppings,
        ingredients: selectedIngredients,
      };
      setPizzas([...pizzas, newPizza]);
      toast({
        title: "Pizza Added",
        description: `${name} has been added successfully.`
      });
    }

    setIsDialogOpen(false);
  };

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
                      src={pizza.imageUrl || "/placeholder.svg"} 
                      alt={pizza.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell>{pizza.name}</TableCell>
                  <TableCell>{pizza.category}</TableCell>
                  <TableCell>£{pizza.sizes.find(s => s.size === 'small')?.price.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>£{pizza.sizes.find(s => s.size === 'medium')?.price.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>£{pizza.sizes.find(s => s.size === 'large')?.price.toFixed(2) || '0.00'}</TableCell>
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
        <DialogContent className="max-w-2xl">
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
                    step="0.01"
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
                    step="0.01"
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
                    step="0.01"
                    min="0"
                    value={largePrice}
                    onChange={(e) => setLargePrice(e.target.value)}
                    placeholder="e.g., 15.99"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
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
                    src={imageUrl}
                    alt="Preview"
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
                    <div key={topping.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2">
                      <span>{topping.name} (x{topping.quantity})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTopping(topping.id)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
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
                    <div key={ingredient.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2">
                      <span>{ingredient.name} (x{ingredient.quantity})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIngredient(ingredient.id)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSave}>
              {editingPizza ? "Update Pizza" : "Add Pizza"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pizzas;
