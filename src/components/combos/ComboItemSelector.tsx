import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { comboService, PizzaSize, Pizza } from "@/services/comboService";
import { useToast } from "@/hooks/use-toast";

type ComboItemSelectorProps = {
  onAddItem: (item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }) => void;
  showSizeSelector?: boolean;
  onAddItemWithSize?: (
    item: { id: string; name: string; price: number; quantity: number },
    size: PizzaSize
  ) => void;
  initialItem?: { id: string; quantity: number; size?: PizzaSize };
};

export function ComboItemSelector({
  onAddItem,
  showSizeSelector = false,
  onAddItemWithSize,
  initialItem,
}: ComboItemSelectorProps) {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("MEDIUM");
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPizzas();
  }, []);

  useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem.id);
      setQuantity(initialItem.quantity);
      if (initialItem.size) {
        setSelectedSize(initialItem.size as PizzaSize);
      }
    }
  }, [initialItem]);

  const loadPizzas = async () => {
    try {
      setIsLoading(true);
      const response = await comboService.getAllPizzas();
      if (response && response.pizzas && Array.isArray(response.pizzas)) {
        setPizzas(response.pizzas);
      } else {
        console.error("Invalid response format:", response);
        setPizzas([]);
      }
    } catch (error) {
      console.error("Error loading pizzas:", error);
      toast({
        title: "Error",
        description: "Failed to load pizzas",
        variant: "destructive",
      });
      setPizzas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    const pizza = pizzas.find((p) => p.id === selectedItem);
    if (!pizza) return;

    const price = pizza.sizes[selectedSize] || pizza.sizes["MEDIUM"];

    if (showSizeSelector && onAddItemWithSize) {
      onAddItemWithSize(
        {
          id: pizza.id,
          name: pizza.name,
          price: pizza.price,
          quantity: quantity,
        },
        selectedSize
      );
    } else {
      onAddItem({
        id: pizza.id,
        name: pizza.name,
        price: price,
        quantity: quantity,
      });
    }

    setSelectedItem("");
    setQuantity(1);
    setSelectedSize("MEDIUM");
  };

  // Check if current selection is a pizza
  const isPizzaSelected = selectedItem
    ? pizzas.find((p) => p.id === selectedItem) !== undefined
    : false;

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <Select value={selectedItem} onValueChange={setSelectedItem}>
          <SelectTrigger>
            <SelectValue placeholder="Select pizza" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(pizzas) &&
              pizzas.map((pizza) => (
                <SelectItem key={pizza.id} value={pizza.id}>
                  {pizza.name} - ${pizza.sizes["MEDIUM"]}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {showSizeSelector && (
        <div className="w-24">
          <Select
            value={selectedSize}
            onValueChange={(value) => setSelectedSize(value as PizzaSize)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMALL">Small</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LARGE">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="w-24">
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>
      <Button
        onClick={handleAddItem}
        disabled={!selectedItem || isLoading}
        variant="secondary"
        size="icon"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
