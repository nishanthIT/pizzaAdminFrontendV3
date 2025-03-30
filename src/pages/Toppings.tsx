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
  Pizza,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Topping, toppingService } from "@/services/toppingService";

const Toppings = () => {
  const { toast } = useToast();
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
  const [toppingName, setToppingName] = useState("");
  const [toppingPrice, setToppingPrice] = useState("");

  useEffect(() => {
    fetchToppings();
  }, []);

  const fetchToppings = async () => {
    try {
      const data = await toppingService.getToppings();
      setToppings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch toppings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingTopping(null);
    setToppingName("");
    setToppingPrice("");
    setIsDialogOpen(true);
  };

  const handleEdit = (topping: Topping) => {
    setEditingTopping(topping);
    setToppingName(topping.name);
    setToppingPrice(topping.price.toString());
    setIsDialogOpen(true);
  };

  const handleDelete = async (topping: Topping) => {
    try {
      await toppingService.deleteTopping(topping.id);
      setToppings(toppings.filter((t) => t.id !== topping.id));
      toast({
        title: "Topping Deleted",
        description: `${topping.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topping",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (topping: Topping) => {
    try {
      const updatedTopping = await toppingService.updateToppingStatus(
        topping.id,
        !topping.status
      );
      setToppings(
        toppings.map((t) => (t.id === topping.id ? updatedTopping : t))
      );
      toast({
        title: topping.status ? "Topping Disabled" : "Topping Enabled",
        description: `${topping.name} has been ${
          topping.status ? "disabled" : "enabled"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update topping status",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!toppingName || !toppingPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(toppingPrice);
    if (isNaN(price)) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTopping) {
        // Update existing topping
        const updatedTopping = await toppingService.updateTopping({
          id: editingTopping.id,
          name: toppingName,
          price: price,
        });
        setToppings(
          toppings.map((t) => (t.id === editingTopping.id ? updatedTopping : t))
        );
        toast({
          title: "Topping Updated",
          description: `${toppingName} has been updated successfully.`,
        });
      } else {
        // Add new topping
        const newTopping = await toppingService.addTopping({
          name: toppingName,
          price: price,
        });
        setToppings([...toppings, newTopping]);
        toast({
          title: "Topping Added",
          description: `${toppingName} has been added successfully.`,
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save topping",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Toppings Management</CardTitle>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Topping
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topping</TableHead>
                <TableHead>Price (£)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toppings.map((topping) => (
                <TableRow key={topping.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Pizza className="h-4 w-4" />
                      <span>{topping.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>£{formatPrice(topping.price)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(topping)}
                    >
                      {topping.status ? (
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
                        onClick={() => handleEdit(topping)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(topping)}
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
              {editingTopping ? "Edit Topping" : "Add New Topping"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Topping Name</label>
              <Input
                value={toppingName}
                onChange={(e) => setToppingName(e.target.value)}
                placeholder="e.g., Pepperoni"
              />
            </div>
            <div className="space-y-2">
              <label>Price (£)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={toppingPrice}
                onChange={(e) => setToppingPrice(e.target.value)}
                placeholder="e.g., 1.99"
              />
            </div>
            <Button onClick={handleSave}>
              {editingTopping ? "Update Topping" : "Add Topping"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Toppings;
