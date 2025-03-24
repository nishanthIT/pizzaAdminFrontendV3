
import { useState } from "react";
import { Check, X, Edit, Trash, Search, Award, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem {
  name: string;
  originalToppings: string[];
  changedToppings: string[];
  originalIngredients: string[];
  changedIngredients: string[];
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
}

const RecentOrders = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [orders] = useState<Order[]>([
    {
      id: "#12345",
      customer: "John Doe",
      items: "Pepperoni Pizza, Coke",
      total: "$24.99",
      status: "Pending",
      rewardPoints: 150,
      hasChanges: true,
      orderItems: [
        {
          name: "Pepperoni Pizza",
          originalToppings: ["Pepperoni", "Cheese", "Tomato Sauce"],
          changedToppings: ["Extra Pepperoni", "Cheese", "Tomato Sauce", "Mushrooms"],
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
      orderItems: [
        {
          name: "Margherita Pizza",
          originalToppings: ["Basil", "Cheese", "Tomato Sauce"],
          changedToppings: ["Basil", "Cheese", "Tomato Sauce"],
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
      status: "Rejected",
      rewardPoints: 95,
      hasChanges: true,
      orderItems: [
        {
          name: "Hawaiian Pizza",
          originalToppings: ["Ham", "Pineapple", "Cheese", "Tomato Sauce"],
          changedToppings: ["Ham", "Extra Pineapple", "Cheese", "Tomato Sauce", "BBQ Sauce"],
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
      orderItems: [
        {
          name: "Vegetarian Pizza",
          originalToppings: ["Bell Peppers", "Onions", "Mushrooms", "Cheese", "Tomato Sauce"],
          changedToppings: ["Bell Peppers", "Onions", "Mushrooms", "Cheese", "Tomato Sauce"],
          originalIngredients: ["Wheat Flour", "Water", "Salt", "Yeast"],
          changedIngredients: ["Wheat Flour", "Water", "Salt", "Yeast"],
        }
      ]
    },
  ]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    toast({
      title: "Order Status Updated",
      description: `Order ${orderId} has been marked as ${newStatus}`,
    });
  };

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
                        : order.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                  {order.status === "Pending" && (
                    <div className="inline-flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleStatusChange(order.id, "Paid")}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleStatusChange(order.id, "Rejected")}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
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
                          {item.changedToppings.map((topping, idx) => (
                            <li key={idx} className={
                              !item.originalToppings.includes(topping) ? 'text-blue-600 font-medium' : ''
                            }>
                              {topping}
                              {!item.originalToppings.includes(topping) && ' (added)'}
                            </li>
                          ))}
                        </ul>
                        
                        {item.originalToppings.map(topping => 
                          !item.changedToppings.includes(topping) ? (
                            <div key={topping} className="text-red-600 text-sm mt-1">
                              <span>- {topping} (removed)</span>
                            </div>
                          ) : null
                        )}
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
                            <div key={ingredient} className="text-red-600 text-sm mt-1">
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
    </div>
  );
};

export default RecentOrders;
