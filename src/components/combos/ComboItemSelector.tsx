
import { useState } from "react";
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
};

export function ComboItemSelector({ onAddItem }: ComboItemSelectorProps) {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddItem = () => {
    const item = menuItems.find((item) => item.id === selectedItem);
    if (item) {
      onAddItem({
        name: item.name,
        price: item.price,
        quantity: quantity,
      });
      setSelectedItem("");
      setQuantity(1);
    }
  };

  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
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
