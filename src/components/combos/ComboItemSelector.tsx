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
import { Label } from "@/components/ui/label";
import { comboService, PizzaSize, Pizza } from "@/services/comboService";
import { useToast } from "@/hooks/use-toast";

type OtherItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

type ComboItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  itemType: 'PIZZA' | 'OTHER_ITEM';
  size?: PizzaSize;
};

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
  onAddItemWithType?: (item: ComboItem) => void;
  initialItem?: { id: string; quantity: number; size?: PizzaSize };
};

export function ComboItemSelector({
  onAddItem,
  showSizeSelector = false,
  onAddItemWithSize,
  onAddItemWithType,
  initialItem,
}: ComboItemSelectorProps) {
  const { toast } = useToast();
  const [selectedItemType, setSelectedItemType] = useState<'PIZZA' | 'OTHER_ITEM'>('PIZZA');
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("MEDIUM");
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [otherItems, setOtherItems] = useState<OtherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
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

  const loadItems = async () => {
    try {
      setIsLoading(true);
      
      // Load pizzas
      const pizzaResponse = await comboService.getAllPizzas();
      if (pizzaResponse && pizzaResponse.pizzas && Array.isArray(pizzaResponse.pizzas)) {
        setPizzas(pizzaResponse.pizzas);
      } else {
        console.error("Invalid pizza response format:", pizzaResponse);
        setPizzas([]);
      }

      // Load other items
      try {
        console.log('Loading other items from:', `${import.meta.env.VITE_API_URL}/api/admin/other-items`);
        const otherItemsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/other-items`, {
          credentials: 'include',
        });
        
        console.log('Other items response status:', otherItemsResponse.status);
        console.log('Other items response headers:', Object.fromEntries(otherItemsResponse.headers.entries()));
        
        if (otherItemsResponse.ok) {
          const otherItemsData = await otherItemsResponse.json();
          console.log('Other items data received:', otherItemsData);
          if (Array.isArray(otherItemsData)) {
            setOtherItems(otherItemsData);
          } else {
            console.error("Invalid other items response format:", otherItemsData);
            setOtherItems([]);
          }
        } else {
          const errorText = await otherItemsResponse.text();
          console.error("Failed to load other items:", otherItemsResponse.status, errorText);
          setOtherItems([]);
        }
      } catch (error) {
        console.error("Error loading other items:", error);
        setOtherItems([]);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive",
      });
      setPizzas([]);
      setOtherItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (selectedItemType === 'PIZZA') {
      const pizza = pizzas.find((p) => p.id === selectedItem);
      if (!pizza) return;

      const price = pizza.sizes[selectedSize] || pizza.sizes["MEDIUM"];

      const comboItem: ComboItem = {
        id: pizza.id,
        name: pizza.name,
        price: price,
        quantity: quantity,
        itemType: 'PIZZA',
        size: selectedSize,
      };

      if (onAddItemWithType) {
        onAddItemWithType(comboItem);
      } else if (showSizeSelector && onAddItemWithSize) {
        onAddItemWithSize(
          {
            id: pizza.id,
            name: pizza.name,
            price: price,
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
    } else if (selectedItemType === 'OTHER_ITEM') {
      const otherItem = otherItems.find((item) => item.id === selectedItem);
      if (!otherItem) return;

      const comboItem: ComboItem = {
        id: otherItem.id,
        name: otherItem.name,
        price: otherItem.price,
        quantity: quantity,
        itemType: 'OTHER_ITEM',
      };

      if (onAddItemWithType) {
        onAddItemWithType(comboItem);
      } else {
        onAddItem({
          id: otherItem.id,
          name: otherItem.name,
          price: otherItem.price,
          quantity: quantity,
        });
      }
    }

    // Reset form
    setSelectedItem("");
    setQuantity(1);
    setSelectedSize("MEDIUM");
  };

  const currentItems = selectedItemType === 'PIZZA' ? pizzas : otherItems;
  const needsSize = selectedItemType === 'PIZZA';

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Item Type</Label>
        <Select 
          value={selectedItemType} 
          onValueChange={(value: 'PIZZA' | 'OTHER_ITEM') => {
            setSelectedItemType(value);
            setSelectedItem(""); // Reset selection when changing type
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select item type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PIZZA">Pizza</SelectItem>
            <SelectItem value="OTHER_ITEM">Other Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label>
            {selectedItemType === 'PIZZA' ? 'Select Pizza' : 'Select Other Item'}
          </Label>
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${selectedItemType === 'PIZZA' ? 'pizza' : 'other item'}`} />
            </SelectTrigger>
            <SelectContent>
              {selectedItemType === 'PIZZA' 
                ? pizzas.map((pizza) => (
                    <SelectItem key={pizza.id} value={pizza.id}>
                      {pizza.name} - £{pizza.sizes["MEDIUM"]}
                    </SelectItem>
                  ))
                : otherItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - £{item.price}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
        </div>

        {(showSizeSelector || needsSize) && needsSize && (
          <div className="w-24">
            <Label>Size</Label>
            <Select
              value={selectedSize}
              onValueChange={(value) => setSelectedSize(value as PizzaSize)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LARGE">Large</SelectItem>
                <SelectItem value="SUPER_SIZE">Super Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="w-24">
          <Label>Quantity</Label>
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
    </div>
  );
}
