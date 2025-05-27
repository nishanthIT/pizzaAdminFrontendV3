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
    pizza?: {
      name: string;
      imageUrl?: string;
    };
    combo?: {
      name: string;
      imageUrl?: string;
    };
    otherItem?: {
      name: string;
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

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Replace fetch with api instance
        const response = await api.get(`/getOrderDetails/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{order.id}
          </h1>
          <p className="text-gray-500">Customer: {order.user.name}</p>
        </div>
        <Badge
          variant={
            order.status === "DELIVERED"
              ? "default"
              : order.status === "CANCELLED"
              ? "destructive"
              : "secondary"
          }
        >
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Modifications</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.isCombo
                            ? `${API_IMG_URL}/images/combo-${item.comboId}.png`
                            : item.isOtherItem
                            ? `${API_IMG_URL}/images/other-${item.otherItemId}.png`
                            : `${API_IMG_URL}/images/pizza-${item.pizzaId}.png`
                        }
                        alt={
                          item.isCombo
                            ? item.combo?.name
                            : item.isOtherItem
                            ? item.otherItem?.name
                            : item.pizza?.name
                        }
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <span className="font-medium">
                        {item.isCombo
                          ? item.combo?.name
                          : item.isOtherItem
                          ? item.otherItem?.name
                          : item.pizza?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {!item.isCombo && (
                      <div className="text-sm">
                        <p>Toppings:</p>
                        {item.orderToppings
                          .filter((topping) => topping.quantity > 0)
                          .map((topping, idx) => (
                            <div
                              key={`topping-${idx}`}
                              className={!topping.include ? "text-red-500" : ""}
                            >
                              {topping.include ? "+" : "-"} {topping.name}
                              {topping.quantity > 0 &&
                                ` (${topping.quantity}x)`}
                            </div>
                          ))}

                        <p className="mt-2">Ingredients:</p>
                        {item.orderIngredients
                          .filter((ingredient) => ingredient.quantity > 0)
                          .map((ingredient, idx) => (
                            <div
                              key={`ingredient-${idx}`}
                              className={
                                !ingredient.include ? "text-red-500" : ""
                              }
                            >
                              {ingredient.include ? "+" : "-"} {ingredient.name}
                              {ingredient.quantity > 0 &&
                                ` (${ingredient.quantity}x)`}
                            </div>
                          ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    £{Number(item.price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
