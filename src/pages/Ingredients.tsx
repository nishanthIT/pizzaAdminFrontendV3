
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Carrot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

const Ingredients = () => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: "Flour", quantity: 50, unit: "kg" },
    { id: 2, name: "Tomato Sauce", quantity: 30, unit: "liters" },
    { id: 3, name: "Mozzarella", quantity: 25, unit: "kg" }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [ingredientUnit, setIngredientUnit] = useState("");

  const handleAddNew = () => {
    setEditingIngredient(null);
    setIngredientName("");
    setIngredientQuantity("");
    setIngredientUnit("");
    setIsDialogOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIngredientName(ingredient.name);
    setIngredientQuantity(ingredient.quantity.toString());
    setIngredientUnit(ingredient.unit);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!ingredientName || !ingredientQuantity || !ingredientUnit) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(ingredientQuantity);
    if (isNaN(quantity)) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    if (editingIngredient) {
      // Update existing ingredient
      setIngredients(ingredients.map(i => 
        i.id === editingIngredient.id 
          ? { ...i, name: ingredientName, quantity: quantity, unit: ingredientUnit }
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
        quantity: quantity,
        unit: ingredientUnit
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
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
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
                  <TableCell>{ingredient.quantity}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ingredient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
              <label>Quantity</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={ingredientQuantity}
                onChange={(e) => setIngredientQuantity(e.target.value)}
                placeholder="e.g., 50"
              />
            </div>
            <div className="space-y-2">
              <label>Unit</label>
              <Input
                value={ingredientUnit}
                onChange={(e) => setIngredientUnit(e.target.value)}
                placeholder="e.g., kg"
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
