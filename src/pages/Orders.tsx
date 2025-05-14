import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecentOrders from "@/components/dashboard/RecentOrders";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, ShoppingBag, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OrderStatusSelect from "@/components/custom/OrderStatusSelect";
import { Loading } from "@/components/ui/loading";

interface OrderContactInfo {
  address?: string;
  phone: string;
  type: "delivery" | "pickup";
}

interface Order {
  id: string;
  customerName: string;
  createdAt: string;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  deliveryMethod: string;
  deliveryAddress?: string;
  totalAmount: number;
  user: {
    phone: string;
  };
}
import api from "@/services/api"; // Adjust the import based on your project structure

// Example service call
const getAllOrders = async () => {
  try {
    console.log("Token:", localStorage.getItem("adminToken")); // Debug token
    const response = await api.get("/admin/getAllOrders");
    return response.data;
  } catch (error) {
    console.error("Full error:", error); // Debug full error
    throw error;
  }
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [contactInfo, setContactInfo] = useState<OrderContactInfo | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Use the api instance instead of fetch
        const response = await api.get("/getAllOrders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleTypeClick = (
    type: "delivery" | "pickup",
    address?: string,
    phone?: string
  ) => {
    if (phone) {
      setContactInfo({
        type,
        address,
        phone,
      });
      setShowContactInfo(true);
    }
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return <Loading message="Loading orders..." />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableCaption>Current Order Summary</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleOrderClick(order.id)}
              >
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.user.phone}</TableCell>
                <TableCell>£{Number(order.totalAmount).toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <OrderStatusSelect
                    orderId={order.id}
                    currentStatus={order.status}
                    onStatusChange={(newStatus) => {
                      setOrders(
                        orders.map((o) =>
                          o.id === order.id
                            ? { ...o, status: newStatus as Order["status"] }
                            : o
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Badge
                    className={`inline-flex items-center gap-1 cursor-pointer ${
                      order.deliveryMethod === "delivery"
                        ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTypeClick(
                        order.deliveryMethod as "delivery" | "pickup",
                        order.deliveryAddress,
                        order.user.phone
                      );
                    }}
                  >
                    {order.deliveryMethod === "delivery" ? (
                      <>
                        <MapPin className="h-3 w-3" />
                        <span>Delivery</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-3 w-3" />
                        <span>Pickup</span>
                      </>
                    )}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Contact Information Dialog */}
      <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {contactInfo?.type === "delivery"
                ? "Delivery Information"
                : "Pickup Information"}
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
                  <p className="font-medium text-sm text-gray-500">
                    Delivery Address
                  </p>
                  <p className="text-gray-900">{contactInfo.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-500">
                  Contact Number
                </p>
                <p className="text-gray-900">{contactInfo?.phone}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
