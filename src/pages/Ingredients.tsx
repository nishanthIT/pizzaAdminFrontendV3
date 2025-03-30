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
  Carrot,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Ingredient, ingredientService } from "@/services/ingredientService";

const Ingredients = () => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientPrice, setIngredientPrice] = useState("");

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const data = await ingredientService.getIngredients();
      setIngredients(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ingredients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  const handleAddNew = () => {
    setEditingIngredient(null);
    setIngredientName("");
    setIngredientPrice("");
    setIsDialogOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIngredientName(ingredient.name);
    setIngredientPrice(formatPrice(ingredient.price));
    setIsDialogOpen(true);
  };

  const handleDelete = async (ingredient: Ingredient) => {
    try {
      await ingredientService.deleteIngredient(ingredient.id);
      setIngredients(ingredients.filter((i) => i.id !== ingredient.id));
      toast({
        title: "Ingredient Deleted",
        description: `${ingredient.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ingredient",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (ingredient: Ingredient) => {
    try {
      const updatedIngredient = await ingredientService.updateIngredientStatus(
        ingredient.id,
        !ingredient.status
      );
      setIngredients(
        ingredients.map((i) => (i.id === ingredient.id ? updatedIngredient : i))
      );
      toast({
        title: ingredient.status ? "Ingredient Disabled" : "Ingredient Enabled",
        description: `${ingredient.name} has been ${
          ingredient.status ? "disabled" : "enabled"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ingredient status",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!ingredientName || !ingredientPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(ingredientPrice);
    if (isNaN(price)) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingIngredient) {
        // Update existing ingredient
        const updatedIngredient = await ingredientService.updateIngredient({
          id: editingIngredient.id,
          name: ingredientName,
          price: price,
        });
        setIngredients(
          ingredients.map((i) =>
            i.id === editingIngredient.id ? updatedIngredient : i
          )
        );
        toast({
          title: "Ingredient Updated",
          description: `${ingredientName} has been updated successfully.`,
        });
      } else {
        // Add new ingredient
        const newIngredient = await ingredientService.addIngredient({
          name: ingredientName,
          price: price,
        });
        setIngredients([...ingredients, newIngredient]);
        toast({
          title: "Ingredient Added",
          description: `${ingredientName} has been added successfully.`,
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save ingredient",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Ingredients Management</CardTitle>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Ingredient
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Price (£)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Carrot className="h-4 w-4" />
                      <span>{ingredient.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>£{formatPrice(ingredient.price)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(ingredient)}
                    >
                      {ingredient.status ? (
                        <ToggleRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(ingredient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ingredient)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Ingredient Name</label>
              <Input
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                placeholder="e.g., Flour"
              />
            </div>
            <div className="space-y-2">
              <label>Price (£)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={ingredientPrice}
                onChange={(e) => setIngredientPrice(e.target.value)}
                placeholder="e.g., 2.99"
              />
            </div>
            <Button onClick={handleSave}>
              {editingIngredient ? "Update Ingredient" : "Add Ingredient"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ingredients;
