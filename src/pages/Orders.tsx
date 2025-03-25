
import RecentOrders from "@/components/dashboard/RecentOrders";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { MapPin, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Orders = () => {
  const orderData = [
    {
      id: "#12345",
      customer: "John Doe",
      date: "2023-04-15",
      status: "Delivered",
      type: "delivery"
    },
    {
      id: "#12346",
      customer: "Jane Smith",
      date: "2023-04-14", 
      status: "Processing",
      type: "pickup"
    },
    {
      id: "#12347",
      customer: "Bob Johnson",
      date: "2023-04-13",
      status: "Delivered",
      type: "delivery"
    }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
      
      {/* Quick Overview Table */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableCaption>Current Order Summary</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderData.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`inline-flex items-center gap-1 ${
                      order.type === "delivery" 
                        ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" 
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                  >
                    {order.type === "delivery" ? (
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

      {/* Detailed Orders Component */}
      <RecentOrders />
    </div>
  );
};

export default Orders;
