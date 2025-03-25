
import { useState } from "react";
import { Edit, Trash, Search, Award, Info, MapPin, ShoppingBag, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ToppingItem {
  name: string;
  quantity?: number;
}

interface OrderItem {
  name: string;
  originalToppings: string[];
  changedToppings: ToppingItem[];
  originalIngredients: string[];
  changedIngredients: string[];
}

interface OrderContactInfo {
  address?: string;
  phone: string;
  type: "delivery" | "pickup";
}

interface Order {
  id: string;
  customer: string;
  items: string;
  total: string;
  status: string;
  rewardPoints: number;
  hasChanges: boolean;
  orderItems: OrderItem[];
  deliveryType: "delivery" | "pickup";
  address?: string;
  phone: string;
}

const RecentOrders = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<OrderContactInfo | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  
  const [orders] = useState<Order[]>([
    {
      id: "#12345",
      customer: "John Doe",
      items: "Pepperoni Pizza, Coke",
      total: "$24.99",
      status: "Paid",
      rewardPoints: 150,
      hasChanges: true,
      deliveryType: "delivery",
      address: "123 Main St, Anytown, USA",
      phone: "555-123-4567",
      orderItems: [
        {
          name: "Pepperoni Pizza",
          originalToppings: ["Pepperoni", "Cheese", "Tomato Sauce"],
          changedToppings: [
            { name: "Cheese", quantity: 1 },
            { name: "Tomato Sauce", quantity: 1 },
            { name: "Pepperoni", quantity: 2 },
            { name: "Mushrooms", quantity: 1 }
          ],
          originalIngredients: ["Wheat Flour", "Water", "Salt", "Yeast"],
          changedIngredients: ["Wheat Flour", "Water", "Salt", "Yeast"],
        }
      ]
    },
    {
      id: "#12346",
      customer: "Jane Smith",
      items: "Margherita Pizza, Garlic Bread",
      total: "$32.50",
      status: "Paid",
      rewardPoints: 280,
      hasChanges: false,
      deliveryType: "pickup",
      phone: "555-987-6543",
      orderItems: [
        {
          name: "Margherita Pizza",
          originalToppings: ["Basil", "Cheese", "Tomato Sauce"],
          changedToppings: [
            { name: "Basil", quantity: 1 },
            { name: "Cheese", quantity: 1 },
            { name: "Tomato Sauce", quantity: 1 }
          ],
          originalIngredients: ["Wheat Flour", "Water", "Salt", "Yeast"],
          changedIngredients: ["Wheat Flour", "Water", "Salt", "Yeast"],
        }
      ]
    },
    {
      id: "#12347",
      customer: "Mike Johnson",
      items: "Hawaiian Pizza, Wings",
      total: "$41.75",
      status: "Paid",
      rewardPoints: 95,
      hasChanges: true,
      deliveryType: "delivery",
      address: "456 Oak Ave, Springfield, USA",
      phone: "555-555-5555",
      orderItems: [
        {
          name: "Hawaiian Pizza",
          originalToppings: ["Ham", "Pineapple", "Cheese", "Tomato Sauce"],
          changedToppings: [
            { name: "Ham", quantity: 1 },
            { name: "Pineapple", quantity: 3 },
            { name: "Cheese", quantity: 1 },
            { name: "Tomato Sauce", quantity: 1 },
            { name: "BBQ Sauce", quantity: 1 }
          ],
          originalIngredients: ["Wheat Flour", "Water", "Salt", "Yeast"],
          changedIngredients: ["Gluten-Free Flour", "Water", "Salt", "Yeast"],
        }
      ]
    },
    {
      id: "#12348",
      customer: "Sarah Williams",
      items: "Vegetarian Pizza",
      total: "$18.99",
      status: "Paid",
      rewardPoints: 320,
      hasChanges: false,
      deliveryType: "pickup",
      phone: "555-888-9999",
      orderItems: [
        {
          name: "Vegetarian Pizza",
          originalToppings: ["Bell Peppers", "Onions", "Mushrooms", "Cheese", "Tomato Sauce"],
          changedToppings: [
            { name: "Bell Peppers", quantity: 1 },
            { name: "Onions", quantity: 1 },
            { name: "Mushrooms", quantity: 1 },
            { name: "Cheese", quantity: 1 },
            { name: "Tomato Sauce", quantity: 1 }
          ],
          originalIngredients: ["Wheat Flour", "Water", "Salt", "Yeast"],
          changedIngredients: ["Wheat Flour", "Water", "Salt", "Yeast"],
        }
      ]
    },
  ]);

  const handleEditCustomer = (customerId: string) => {
    toast({
      title: "Edit Customer",
      description: `Editing customer information for ${customerId}`,
    });
  };

  const handleDeleteCustomer = (customerId: string) => {
    toast({
      title: "Delete Customer",
      description: `Customer ${customerId} has been deleted`,
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleTypeClick = (order: Order) => {
    setContactInfo({
      type: order.deliveryType,
      address: order.address,
      phone: order.phone
    });
    setShowContactInfo(true);
  };

  const filteredOrders = orders.filter((order) =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Order ID
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Items
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Total
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Type
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Changes
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Reward Points
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-800">{order.id}</td>
                <td className="py-3 px-4 text-sm text-gray-800">
                  {order.customer}
                </td>
                <td className="py-3 px-4 text-sm text-gray-800">{order.items}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{order.total}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                      order.deliveryType === "delivery"
                        ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                    onClick={() => handleTypeClick(order)}
                  >
                    {order.deliveryType === "delivery" ? (
                      <MapPin className="mr-1 h-3 w-3" />
                    ) : (
                      <ShoppingBag className="mr-1 h-3 w-3" />
                    )}
                    {order.deliveryType === "delivery" ? "Delivery" : "Pickup"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.hasChanges
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.hasChanges ? "Yes" : "No"}
                  </span>
                  {order.hasChanges && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-6 w-6"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Info className="h-4 w-4 text-blue-600" />
                    </Button>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-800">
                      {order.rewardPoints}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditCustomer(order.customer)}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteCustomer(order.customer)}
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Order Details {selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            {selectedOrder?.orderItems.map((item, index) => (
              <div key={index} className="mb-6 border-b pb-4">
                <h3 className="text-lg font-medium mb-3">{item.name}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Toppings</h4>
                    <div className="flex flex-col space-y-2">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="text-sm font-medium text-gray-500 block mb-1">Original:</span>
                        <ul className="list-disc pl-5 text-sm">
                          {item.originalToppings.map((topping, idx) => (
                            <li key={idx}>{topping}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md">
                        <span className="text-sm font-medium text-blue-500 block mb-1">Changed:</span>
                        <ul className="list-disc pl-5 text-sm">
                          {item.changedToppings.map((topping, idx) => {
                            const isAdded = !item.originalToppings.includes(topping.name);
                            const isIncreasedQuantity = item.originalToppings.includes(topping.name) && topping.quantity && topping.quantity > 1;
                            const showQuantity = topping.quantity && topping.quantity > 1;
                            
                            return (
                              <li key={idx} className={isAdded || isIncreasedQuantity ? 'text-blue-600 font-medium' : ''}>
                                {topping.name}
                                {showQuantity && (
                                  <span className={isIncreasedQuantity ? "text-blue-600 font-medium" : ""}>
                                    {" "}
                                    {topping.quantity}X
                                  </span>
                                )}
                                {isAdded && ' (added)'}
                              </li>
                            );
                          })}
                        </ul>
                        
                        {item.originalToppings.map(topping => {
                          const exists = item.changedToppings.some(t => t.name === topping);
                          if (!exists) {
                            return (
                              <div key={topping} className="text-red-600 font-medium text-sm mt-1">
                                <span>- {topping} (removed)</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Ingredients</h4>
                    <div className="flex flex-col space-y-2">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="text-sm font-medium text-gray-500 block mb-1">Original:</span>
                        <ul className="list-disc pl-5 text-sm">
                          {item.originalIngredients.map((ingredient, idx) => (
                            <li key={idx}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md">
                        <span className="text-sm font-medium text-blue-500 block mb-1">Changed:</span>
                        <ul className="list-disc pl-5 text-sm">
                          {item.changedIngredients.map((ingredient, idx) => (
                            <li key={idx} className={
                              !item.originalIngredients.includes(ingredient) ? 'text-blue-600 font-medium' : ''
                            }>
                              {ingredient}
                              {!item.originalIngredients.includes(ingredient) && ' (added)'}
                            </li>
                          ))}
                        </ul>
                        
                        {item.originalIngredients.map(ingredient => 
                          !item.changedIngredients.includes(ingredient) ? (
                            <div key={ingredient} className="text-red-600 font-medium text-sm mt-1">
                              <span>- {ingredient} (removed)</span>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Information Dialog */}
      <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {contactInfo?.type === "delivery" ? "Delivery Information" : "Pickup Information"}
            </DialogTitle>
            <DialogDescription>
              Contact details for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {contactInfo?.type === "delivery" && contactInfo?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-500">Delivery Address</p>
                  <p className="text-gray-900">{contactInfo.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-500">Contact Number</p>
                <p className="text-gray-900">{contactInfo?.phone}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecentOrders;
