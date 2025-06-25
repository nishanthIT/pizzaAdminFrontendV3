
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
import { MapPin, ShoppingBag, Phone, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OrderStatusSelect from "@/components/custom/OrderStatusSelect";
import { Loading } from "@/components/ui/loading";
import api from "@/services/api";

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

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [contactInfo, setContactInfo] = useState<OrderContactInfo | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Use the correct API endpoint
      const response = await api.get("/getAllOrders");
      
      if (response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          setError("Authentication failed. Please login again.");
          // Optionally redirect to login
          // navigate('/login');
        } else if (error.response.status === 403) {
          setError("Access denied. Insufficient permissions.");
        } else {
          setError(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setError("Network error. Please check your connection.");
      } else {
        // Something else happened
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    fetchOrders(true);
  };

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

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prevOrders =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus as Order["status"] }
          : order
      )
    );
  };

  if (loading) {
    return <Loading message="Loading orders..." />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load orders
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => fetchOrders()} disabled={refreshing}>
              {refreshing ? (
                <div className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </div>
              ) : (
                <div className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders ({orders.length} orders)
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableCaption>
            {orders.length === 0 
              ? "No orders found" 
              : `Showing ${orders.length} order${orders.length !== 1 ? 's' : ''}`
            }
          </TableCaption>
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
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">No orders found</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleOrderClick(order.id)}
                >
                  <TableCell className="font-medium">
                    #{order.id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {order.user.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      £{Number(order.totalAmount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <OrderStatusSelect
                      orderId={order.id}
                      currentStatus={order.status}
                      onStatusChange={(newStatus) => 
                        handleStatusChange(order.id, newStatus)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
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
              ))
            )}
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
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-500 mb-1">
                    Delivery Address
                  </p>
                  <p className="text-gray-900 break-words">{contactInfo.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-500 mb-1">
                  Contact Number
                </p>
                <p className="text-gray-900">
                  <a 
                    href={`tel:${contactInfo?.phone}`}
                    className="hover:underline text-blue-600"
                  >
                    {contactInfo?.phone}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;  