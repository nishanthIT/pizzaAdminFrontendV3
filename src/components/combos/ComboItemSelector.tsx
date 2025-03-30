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

type PizzaSize = "small" | "medium" | "large";

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

// Sample menu items (you should replace this with your actual data)
const menuItems: MenuItem[] = [
  { id: "1", name: "Margherita Pizza", price: 12.99 },
  { id: "2", name: "Pepperoni Pizza", price: 14.99 },
  { id: "3", name: "Veggie Supreme", price: 13.99 },
  { id: "4", name: "Chicken Wings", price: 9.99 },
  { id: "5", name: "Garlic Bread", price: 4.99 },
];

type ComboItemSelectorProps = {
  onAddItem: (item: { name: string; price: number; quantity: number }) => void;
  showSizeSelector?: boolean;
  onAddItemWithSize?: (
    item: { name: string; price: number; quantity: number },
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
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("medium");

  // Initialize with initial values if provided (for editing)
  useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem.id);
      setQuantity(initialItem.quantity);
      if (initialItem.size) {
        setSelectedSize(initialItem.size);
      }
    }
  }, [initialItem]);

  const handleAddItem = () => {
    const item = menuItems.find((item) => item.id === selectedItem);
    if (!item) return;

    // If it's a pizza and size selector is shown, use the size-specific handler
    const isPizza = item.name.toLowerCase().includes("pizza");
    if (isPizza && showSizeSelector && onAddItemWithSize) {
      onAddItemWithSize(
        {
          name: item.name,
          price: adjustPriceBySize(item.price, selectedSize),
          quantity: quantity,
        },
        selectedSize
      );
    } else {
      // Otherwise use the regular handler
      onAddItem({
        name: item.name,
        price: item.price,
        quantity: quantity,
      });
    }

    setSelectedItem("");
    setQuantity(1);
  };

  // Adjust price based on pizza size
  const adjustPriceBySize = (basePrice: number, size: PizzaSize): number => {
    switch (size) {
      case "small":
        return basePrice * 0.8;
      case "large":
        return basePrice * 1.2;
      default:
        return basePrice; // medium is the base price
    }
  };

  // Check if current selection is a pizza
  const isPizzaSelected = selectedItem
    ? menuItems
        .find((item) => item.id === selectedItem)
        ?.name.toLowerCase()
        .includes("pizza")
    : false;

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <Select value={selectedItem} onValueChange={setSelectedItem}>
          <SelectTrigger>
            <SelectValue placeholder="Select menu item" />
          </SelectTrigger>
          <SelectContent>
            {menuItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name} - ${item.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showSizeSelector && isPizzaSelected && (
        <div className="w-24">
          <Select
            value={selectedSize}
            onValueChange={(value) => setSelectedSize(value as PizzaSize)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
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
        disabled={!selectedItem}
        variant="secondary"
        size="icon"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
