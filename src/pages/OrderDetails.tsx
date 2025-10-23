import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Phone, CalendarClock } from "lucide-react";
import { API_IMG_URL, API_URL } from "@/services/config";
import api from "@/services/api"; // Add this import

interface OrderDetails {
  id: string;
  customerName: string;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  deliveryMethod: string;
  deliveryAddress?: string;
  pickupTime?: string;
  paymentId: string;
  paymentStatus: string;
  createdAt: string;
  customerNotes?: string; // Add customer notes field

  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    size: string;
    price: number;
    isCombo: boolean;
    isOtherItem?: boolean;
    pizzaId?: string;
    comboId?: string;
    otherItemId?: string;
    comboStyleItemId?: string; // Add combo style item ID
    userChoiceId?: string; // Add user choice ID
    pizzaBuilderDealId?: string; // Add pizza builder deal ID
    sauce?: string; // Add sauce field
    selectedSidesNames?: string; // Add selected sides (JSON string)
    selectedDrinksNames?: string; // Add selected drinks (JSON string)
    isMealDeal?: boolean; // Add meal deal flag
    userChoiceDetails?: { // Add user choice details
      name: string;
      description?: string;
      selectedItems: {
        [categoryType: string]: Array<{
          name: string;
          quantity: number;
        }>;
      };
    };
    // Direct fields on the item
    name?: string;
    title?: string;
    pizza?: {
      name: string;
      imageUrl?: string;
    };
    combo?: {
      name: string;
      imageUrl?: string;
    };
    comboStyleItem?: { // Add combo style item relation
      name: string;
      imageUrl?: string;
    };
    userChoice?: { // Add user choice relation
      name: string;
      imageUrl?: string;
    };
    otherItem?: {
      name?: string;
      title?: string;
      imageUrl?: string;
    };
    orderToppings: Array<{
      name: string;
      quantity: number;
      price: number;
      include: boolean;
    }>;
    orderIngredients: Array<{
      name: string;
      quantity: number;
      price: number;
      include: boolean;
    }>;
  }>;
}

// Component to show combo-style item modifications (sauce, sides, drinks)
const ComboStyleModifications = ({ item, isMobile, sidesAndDrinksLookup }: {
  item: any,
  isMobile: boolean,
  sidesAndDrinksLookup: { [key: string]: string }
}) => {
  const containerClass = isMobile ? 'mt-2 space-y-2' : 'text-sm space-y-2';
  const textSize = isMobile ? 'text-xs' : 'text-sm';
  const badgeSize = isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  // Parse selected items
  let selectedSidesNames = [];
  let selectedDrinksNames = [];
  
  try {
    if (item.selectedSidesNames) {
      if (typeof item.selectedSidesNames === 'string') {
        selectedSidesNames = JSON.parse(item.selectedSidesNames);
      } else if (Array.isArray(item.selectedSidesNames)) {
        selectedSidesNames = item.selectedSidesNames;
      }
    }
  } catch (e) {
    console.error('Error parsing selectedSidesNames:', e);
  }
  
  try {
    if (item.selectedDrinksNames) {
      if (typeof item.selectedDrinksNames === 'string') {
        selectedDrinksNames = JSON.parse(item.selectedDrinksNames);
      } else if (Array.isArray(item.selectedDrinksNames)) {
        selectedDrinksNames = item.selectedDrinksNames;
      }
    }
  } catch (e) {
    console.error('Error parsing selectedDrinksNames:', e);
  }

  const hasModifications = item.sauce || selectedSidesNames.length > 0 || selectedDrinksNames.length > 0;

  if (!hasModifications) {
    return (
      <div className={`${textSize} text-gray-500`}>
        No modifications available
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Show sauce */}
      {item.sauce && (
        <div>
          <p className={`font-medium ${textSize} mb-1 text-gray-700`}>Sauce:</p>
          <span className={`bg-red-50 text-red-700 border border-red-200 ${badgeSize} rounded-md inline-flex items-center font-medium`}>
            {item.sauce}
          </span>
        </div>
      )}

      {/* Show selected sides */}
      {selectedSidesNames.length > 0 && (
        <div>
          <p className={`font-medium ${textSize} mb-1 text-gray-700`}>Sides:</p>
          <div className="flex flex-wrap gap-1">
            {selectedSidesNames.map((side: any, idx: number) => (
              <span
                key={`side-${idx}`}
                className={`bg-blue-50 text-blue-700 border border-blue-200 ${badgeSize} rounded-md inline-flex items-center font-medium`}
              >
                {sidesAndDrinksLookup[side] || side}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Show selected drinks */}
      {selectedDrinksNames.length > 0 && (
        <div>
          <p className={`font-medium ${textSize} mb-1 text-gray-700`}>Drinks:</p>
          <div className="flex flex-wrap gap-1">
            {selectedDrinksNames.map((drink: any, idx: number) => (
              <span
                key={`drink-${idx}`}
                className={`bg-green-50 text-green-700 border border-green-200 ${badgeSize} rounded-md inline-flex items-center font-medium`}
              >
                {sidesAndDrinksLookup[drink] || drink}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Show if it's a meal deal */}
      {item.isMealDeal && (
        <div>
          <span className={`bg-purple-50 text-purple-700 border border-purple-200 ${badgeSize} rounded-md inline-flex items-center font-medium`}>
            Meal Deal
          </span>
        </div>
      )}
    </div>
  );
};

// Component to show user choice meal deal selected items
const UserChoiceDetails = ({ item, isMobile }: {
  item: any,
  isMobile: boolean
}) => {
  const containerClass = isMobile ? 'mt-2 space-y-2' : 'text-sm space-y-2';
  const textSize = isMobile ? 'text-xs' : 'text-sm';
  const badgeSize = isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  if (!item.userChoiceDetails || !item.userChoiceDetails.selectedItems) {
    return (
      <div className={`${textSize} text-gray-500`}>
        No user choice details available
      </div>
    );
  }

  const selectedItems = item.userChoiceDetails.selectedItems;
  const hasSelectedItems = Object.keys(selectedItems).length > 0;

  if (!hasSelectedItems) {
    return (
      <div className={`${textSize} text-gray-500`}>
        No items selected
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {item.userChoiceDetails.description && (
        <div>
          <p className={`${textSize} text-gray-600 mb-2`}>
            {item.userChoiceDetails.description}
          </p>
        </div>
      )}

      {Object.entries(selectedItems).map(([categoryType, items]: [string, any[]]) => (
        <div key={categoryType}>
          <p className={`font-medium ${textSize} mb-1 text-gray-700 capitalize`}>
            {categoryType}:
          </p>
          <div className="flex flex-wrap gap-1">
            {items.map((selectedItem: any, idx: number) => (
              <span
                key={`${categoryType}-${idx}`}
                className={`bg-orange-50 text-orange-700 border border-orange-200 ${badgeSize} rounded-md inline-flex items-center font-medium`}
              >
                {selectedItem.name} {selectedItem.quantity > 1 && `(${selectedItem.quantity})`}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Component to show pizza modifications with comparison to original
const PizzaModifications = ({ item, onFetchPizza, isMobile }: {
  item: any,
  onFetchPizza: (pizzaId: string) => Promise<any>,
  isMobile: boolean
}) => {
  const [originalPizza, setOriginalPizza] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Don't render if this is part of a user choice meal
  if (item.userChoiceId || item.userChoiceDetails) {
    return <div className={`text-xs text-gray-500 ${isMobile ? 'mt-2' : ''}`}>No modifications available</div>;
  }

  useEffect(() => {
    // Check if pizza data is already available in the item
    if (item.pizza) {
      setOriginalPizza(item.pizza);
      return;
    }
    
    // Only fetch pizza details if this is NOT part of a user choice meal and pizza data is not available
    if (item.pizzaId && !item.userChoiceId && !item.userChoiceDetails && !item.pizza) {
      setLoading(true);
      onFetchPizza(item.pizzaId).then((pizza) => {
        setOriginalPizza(pizza);
        setLoading(false);
      }).catch((error) => {
        console.error("Error fetching pizza details:", error);
        setLoading(false);
      });
    }
  }, [item.pizzaId, item.pizza, onFetchPizza]);

  if (loading) {
    return <div className={`text-xs text-gray-500 ${isMobile ? 'mt-2' : ''}`}>Loading modifications...</div>;
  }

  if (!originalPizza) {
    return <div className={`text-xs text-gray-500 ${isMobile ? 'mt-2' : ''}`}>No modifications available</div>;
  }

  // Check if we have detailed pizza data with default toppings/ingredients
  const hasDetailedPizzaData = originalPizza.defaultToppings || originalPizza.defaultIngredients;
  
  if (!hasDetailedPizzaData) {
    // If we only have basic pizza data, just show current toppings without comparison
    const currentToppings = item.orderToppings?.filter((t: any) => t.include && t.quantity > 0) || [];
    const currentIngredients = item.orderIngredients?.filter((i: any) => i.include && i.quantity > 0) || [];
    
    if (currentToppings.length === 0 && currentIngredients.length === 0) {
      return <div className={`text-xs text-gray-500 ${isMobile ? 'mt-2' : ''}`}>No modifications available</div>;
    }

    return (
      <div className={`text-xs space-y-2 ${isMobile ? 'mt-2' : ''}`}>
        <div className="font-medium text-gray-700">Base:</div>
        <div className="text-gray-600">{item.pizzaBase || 'Regular Crust'}</div>
        
        {currentToppings.length > 0 && (
          <>
            <div className="font-medium text-gray-700">Toppings:</div>
            <div className="flex flex-wrap gap-1">
              {currentToppings.map((topping: any, idx: number) => (
                <span key={idx} className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs">
                  {topping.name} ({topping.quantity})
                </span>
              ))}
            </div>
          </>
        )}
        
        {currentIngredients.length > 0 && (
          <>
            <div className="font-medium text-gray-700">Ingredients:</div>
            <div className="flex flex-wrap gap-1">
              {currentIngredients.map((ingredient: any, idx: number) => (
                <span key={idx} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                  {ingredient.name} ({ingredient.quantity})
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Create maps for easy lookup
  const originalToppings = new Map();
  const originalIngredients = new Map();

  originalPizza.defaultToppings?.forEach((dt: any) => {
    originalToppings.set(dt.name, { quantity: dt.quantity, include: dt.include });
  });

  originalPizza.defaultIngredients?.forEach((di: any) => {
    originalIngredients.set(di.name, { quantity: di.quantity, include: di.include });
  });

  // Only show toppings (not ingredients)
  const allToppings = item.orderToppings?.filter((ot: any) => {
    // Show all toppings with quantity >= 1
    return ot.quantity >= 1;
  }) || [];

  const containerClass = isMobile ? 'mt-2 space-y-2' : 'text-sm space-y-2';
  const textSize = isMobile ? 'text-xs' : 'text-sm';
  const badgeSize = isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <div className={containerClass}>
      {/* Show pizza base from order item */}
      {item.pizzaBase && (
        <div>
          <p className={`font-medium ${textSize} mb-1 text-gray-700`}>Base:</p>
          <span className={`bg-gray-100 text-gray-700 ${badgeSize} rounded-md inline-flex items-center font-medium`}>
            {item.pizzaBase}
          </span>
        </div>
      )}

      {/* Show toppings */}
      {allToppings.length > 0 && (
        <div>
          <p className={`font-medium ${textSize} mb-1 text-gray-700`}>Toppings:</p>
          <div className="flex flex-wrap gap-1">
            {allToppings.map((topping: any, idx: number) => {
              const original = originalToppings.get(topping.name);
              const isDefault = original && original.quantity === topping.quantity;

              // Green if matches default, orange if modified
              const badgeColor = isDefault
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-orange-50 text-orange-700 border border-orange-200';

              return (
                <span
                  key={`topping-${idx}`}
                  className={`${badgeColor} ${badgeSize} rounded-md inline-flex items-center font-medium`}
                >
                  {topping.name} ({topping.quantity})
                </span>
              );
            })}
          </div>
        </div>
      )}

      {allToppings.length === 0 && (
        <div className={`${textSize} text-gray-500`}>
          No toppings
        </div>
      )}
    </div>
  );
};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [pizzaDetails, setPizzaDetails] = useState<{ [key: string]: any }>({});
  const [sidesAndDrinks, setSidesAndDrinks] = useState<{ [key: string]: any }>({});

  // Fetch pizza details for modification comparison
  const fetchPizzaDetails = async (pizzaId: string) => {
    if (pizzaDetails[pizzaId]) return pizzaDetails[pizzaId];

    try {
      // Use the main API endpoint (port 3003) instead of admin API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getPizzaById/${pizzaId}`);
      const data = await response.json();

      // Try different response structures
      let pizza = null;
      if (data) {
        // Try data.data first (nested structure)
        if (data.data) {
          pizza = data.data;
        }
        // Try data directly
        else if (data.id || data.name) {
          pizza = data;
        }
        // Try if data is an array
        else if (Array.isArray(data) && data.length > 0) {
          pizza = data[0];
        }
      }

      if (pizza && (pizza.id || pizza.name)) {
        setPizzaDetails(prev => ({ ...prev, [pizzaId]: pizza }));
        return pizza;
      } else {
        // Return a mock structure to avoid errors
        const mockPizza = {
          id: pizzaId,
          name: 'Custom Pizza',
          defaultToppings: [],
          defaultIngredients: [],
          base: 'Regular'
        };
        setPizzaDetails(prev => ({ ...prev, [pizzaId]: mockPizza }));
        return mockPizza;
      }
    } catch (error) {
      console.error("Error fetching pizza details:", error);
      // Return a mock structure to avoid errors
      const mockPizza = {
        id: pizzaId,
        name: 'Custom Pizza',
        defaultToppings: [],
        defaultIngredients: [],
        base: 'Regular'
      };
      setPizzaDetails(prev => ({ ...prev, [pizzaId]: mockPizza }));
      return mockPizza;
    }
  };

  // Fetch sides and drinks details for name lookup
  const fetchSidesAndDrinks = async () => {
    try {
      // Fetch sides and drinks from the combo style items endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getComboStyleItemSides`);
      const data = await response.json();
      
      const lookup: { [key: string]: string } = {};
      
      // Process sides
      if (data.sides) {
        data.sides.forEach((side: any) => {
          lookup[side.id] = side.name;
        });
      }
      
      // Process drinks
      if (data.drinks) {
        data.drinks.forEach((drink: any) => {
          lookup[drink.id] = drink.name;
        });
      }
      
      setSidesAndDrinks(lookup);
    } catch (error) {
      console.error("Error fetching sides and drinks:", error);
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Replace fetch with api instance
        const response = await api.get(`/api/admin/getOrderDetails/${id}`); // Corrected path
        setOrder(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    fetchSidesAndDrinks(); // Fetch sides and drinks data for lookup
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4">
      {/* Header - Mobile responsive */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Order #{order.id.slice(-8)}
          </h1>
          <p className="text-sm md:text-base text-gray-500">Customer: {order.user.name}</p>
        </div>
        <Badge
          variant={
            order.status === "DELIVERED"
              ? "default"
              : order.status === "CANCELLED"
                ? "destructive"
                : "secondary"
          }
          className="self-start md:self-auto"
        >
          {order.status}
        </Badge>
      </div>

      {/* Cards - Mobile responsive grid */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-sm text-gray-500">{order.user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{order.user.phone}</span>
              </div>
            </div>
            {order.deliveryMethod === "delivery" && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm text-gray-500">
                    Delivery Address
                  </p>
                  <p>{order.deliveryAddress}</p>
                </div>
              </div>
            )}
            {order.deliveryMethod === "pickup" && order.pickupTime && (
              <div className="flex items-start gap-2">
                <CalendarClock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm text-gray-500">
                    Pickup Time
                  </p>
                  <p>{order.pickupTime}</p>
                </div>
              </div>
            )}
            {order.customerNotes && (
              <div className="border-t pt-4">
                <p className="font-medium text-sm text-gray-500 mb-2">
                  Special Instructions
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm">{order.customerNotes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Order Date</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Status</span>
              <Badge
                variant={
                  order.paymentStatus === "PAID" ? "default" : "secondary"
                }
              >
                {order.paymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment ID</span>
              <span className="font-mono text-sm">
                {order.paymentId || "N/A"}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total Amount</span>
              <span>£{Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items - Mobile responsive */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            <div className="space-y-4 p-4">
              {order.orderItems.map((item) => {
                // Get item name with fallback
                const getItemName = () => {
                  if (item.comboStyleItemId && item.comboStyleItem) {
                    // For combo-style items, show the item name with size
                    const baseName = item.comboStyleItem.name || 'Combo Style Item';
                    const size = item.size;
                    return `${baseName} (${size})`;
                  } else if (item.userChoiceId && item.userChoiceDetails) {
                    return item.userChoiceDetails.name;
                  } else if (item.userChoiceDetails && item.userChoiceDetails.name) {
                    // Fallback user choice detection
                    return item.userChoiceDetails.name;
                  } else if (item.isCombo) {
                    return item.combo?.name || 'Combo Item';
                  } else if (item.isOtherItem) {
                    return item.otherItem?.name ||
                      item.otherItem?.title ||
                      item.title ||
                      item.name ||
                      'Other Item';
                  } else if (!item.pizzaId && !item.comboId && !item.otherItemId && 
                            !item.comboStyleItemId && !item.userChoiceId &&
                            item.price && parseFloat(String(item.price)) > 50) {
                    // Detect orphaned user choice items by price and lack of other identifiers
                    return 'User Choice Deal (Legacy)';
                  } else {
                    return item.pizza?.name || 'Custom Pizza';
                  }
                };

                return (
                  <Card key={item.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={
                            item.comboStyleItemId
                              ? `${API_IMG_URL}/images/combostyle-${item.comboStyleItemId}.png`
                              : item.userChoiceId && item.userChoice?.imageUrl
                                ? `${API_IMG_URL}${item.userChoice.imageUrl}`
                                : item.isCombo
                                  ? `${API_IMG_URL}/images/combo-${item.comboId}.png`
                                  : item.isOtherItem
                                    ? `${API_IMG_URL}/images/other-${item.otherItemId}.png`
                                    : `${API_IMG_URL}/images/pizza-${item.pizzaId}.png`
                          }
                          alt={getItemName()}
                          className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1 truncate">
                            {getItemName()}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {item.size}
                            </span>
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              Qty: {item.quantity}
                            </span>
                            {item.pizzaBuilderDealId && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                Pizza Builder
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-sm">
                            £{Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Mobile Modifications */}
                      {item.comboStyleItemId ? (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <ComboStyleModifications
                            item={item}
                            isMobile={true}
                            sidesAndDrinksLookup={sidesAndDrinks}
                          />
                        </div>
                      ) : item.userChoiceId || item.userChoiceDetails ? (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <UserChoiceDetails
                            item={item}
                            isMobile={true}
                          />
                        </div>
                      ) : !item.isCombo && !item.isOtherItem ? (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <PizzaModifications
                            item={item}
                            onFetchPizza={fetchPizzaDetails}
                            isMobile={true}
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                          No modifications available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Item</TableHead>
                  <TableHead className="w-[100px]">Size</TableHead>
                  <TableHead className="w-[80px]">Quantity</TableHead>
                  <TableHead>Modifications</TableHead>
                  <TableHead className="text-right w-[100px]">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems.map((item) => {
                  // Get item name with fallback
                  const getItemName = () => {
                    if (item.comboStyleItemId && item.comboStyleItem) {
                      // For combo-style items, show the item name with size
                      const baseName = item.comboStyleItem.name || 'Combo Style Item';
                      const size = item.size;
                      return `${baseName} (${size})`;
                    } else if (item.userChoiceId && item.userChoiceDetails) {
                      return item.userChoiceDetails.name;
                    } else if (item.userChoiceDetails && item.userChoiceDetails.name) {
                      // Fallback user choice detection
                      return item.userChoiceDetails.name;
                    } else if (item.isCombo) {
                      return item.combo?.name || 'Combo Item';
                    } else if (item.isOtherItem) {
                      return item.otherItem?.name ||
                        item.otherItem?.title ||
                        item.title ||
                        item.name ||
                        'Other Item';
                    } else if (!item.pizzaId && !item.comboId && !item.otherItemId && 
                              !item.comboStyleItemId && !item.userChoiceId &&
                              item.price && parseFloat(String(item.price)) > 50) {
                      // Detect orphaned user choice items by price and lack of other identifiers
                      return 'User Choice Deal (Legacy)';
                    } else {
                      return item.pizza?.name || 'Custom Pizza';
                    }
                  };

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.comboStyleItemId
                                ? `${API_IMG_URL}/images/combo-style-${item.comboStyleItemId}.png`
                                : item.userChoiceId && item.userChoice?.imageUrl
                                  ? `${API_IMG_URL}${item.userChoice.imageUrl}`
                                  : item.isCombo
                                    ? `${API_IMG_URL}/images/combo-${item.comboId}.png`
                                    : item.isOtherItem
                                      ? `${API_IMG_URL}/images/other-${item.otherItemId}.png`
                                      : `${API_IMG_URL}/images/pizza-${item.pizzaId}.png`
                            }
                            alt={getItemName()}
                            className="h-10 w-10 rounded-md object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <span className="font-medium">
                              {getItemName()}
                            </span>
                            {item.pizzaBuilderDealId && (
                              <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                Pizza Builder
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.comboStyleItemId ? (
                          <ComboStyleModifications
                            item={item}
                            isMobile={false}
                            sidesAndDrinksLookup={sidesAndDrinks}
                          />
                        ) : item.userChoiceId || item.userChoiceDetails ? (
                          <UserChoiceDetails
                            item={item}
                            isMobile={false}
                          />
                        ) : !item.isCombo && !item.isOtherItem ? (
                          <PizzaModifications
                            item={item}
                            onFetchPizza={fetchPizzaDetails}
                            isMobile={false}
                          />
                        ) : (
                          <div className="text-sm text-gray-500">
                            No modifications available
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        £{Number(item.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
