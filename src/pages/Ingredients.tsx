
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Carrot, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Ingredient {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

const Ingredients = () => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: "Flour", price: 2.99, isActive: true },
    { id: 2, name: "Tomato Sauce", price: 3.50, isActive: true },
    { id: 3, name: "Mozzarella", price: 4.99, isActive: false }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientPrice, setIngredientPrice] = useState("");

  const handleAddNew = () => {
    setEditingIngredient(null);
    setIngredientName("");
    setIngredientPrice("");
    setIsDialogOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIngredientName(ingredient.name);
    setIngredientPrice(ingredient.price.toString());
    setIsDialogOpen(true);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setIngredients(ingredients.filter(i => i.id !== ingredient.id));
    toast({
      title: "Ingredient Deleted",
      description: `${ingredient.name} has been deleted successfully.`
    });
  };

  const handleToggleActive = (ingredient: Ingredient) => {
    setIngredients(ingredients.map(i => 
      i.id === ingredient.id 
        ? { ...i, isActive: !i.isActive }
        : i
    ));
    toast({
      title: ingredient.isActive ? "Ingredient Disabled" : "Ingredient Enabled",
      description: `${ingredient.name} has been ${ingredient.isActive ? "disabled" : "enabled"}.`
    });
  };

  const handleSave = () => {
    if (!ingredientName || !ingredientPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const price = parseFloat(ingredientPrice);
    if (isNaN(price)) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    if (editingIngredient) {
      // Update existing ingredient
      setIngredients(ingredients.map(i => 
        i.id === editingIngredient.id 
          ? { ...i, name: ingredientName, price: price }
          : i
      ));
      toast({
        title: "Ingredient Updated",
        description: `${ingredientName} has been updated successfully.`
      });
    } else {
      // Add new ingredient
      const newIngredient: Ingredient = {
        id: Math.max(...ingredients.map(i => i.id)) + 1,
        name: ingredientName,
        price: price,
        isActive: true
      };
      setIngredients([...ingredients, newIngredient]);
      toast({
        title: "Ingredient Added",
        description: `${ingredientName} has been added successfully.`
      });
    }

    setIsDialogOpen(false);
  };

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
                  <TableCell>£{ingredient.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(ingredient)}
                    >
                      {ingredient.isActive ? (
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
