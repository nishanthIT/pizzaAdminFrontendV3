
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
import { MapPin, ShoppingBag, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderContactInfo {
  address?: string;
  phone: string;
  type: "delivery" | "pickup";
}

const Orders = () => {
  const [contactInfo, setContactInfo] = useState<OrderContactInfo | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const orderData = [
    {
      id: "#12345",
      customer: "John Doe",
      date: "2023-04-15",
      status: "Delivered",
      type: "delivery",
      address: "123 Main St, Anytown, USA",
      phone: "555-123-4567"
    },
    {
      id: "#12346",
      customer: "Jane Smith",
      date: "2023-04-14", 
      status: "Processing",
      type: "pickup",
      phone: "555-987-6543"
    },
    {
      id: "#12347",
      customer: "Bob Johnson",
      date: "2023-04-13",
      status: "Delivered",
      type: "delivery",
      address: "456 Oak Ave, Springfield, USA",
      phone: "555-555-5555"
    }
  ];

  const handleTypeClick = (type: "delivery" | "pickup", address?: string, phone?: string) => {
    if (phone) {
      setContactInfo({
        type,
        address,
        phone
      });
      setShowContactInfo(true);
    }
  };

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
                    className={`inline-flex items-center gap-1 cursor-pointer ${
                      order.type === "delivery" 
                        ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" 
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                    onClick={() => handleTypeClick(
                      order.type as "delivery" | "pickup", 
                      order.address, 
                      order.phone
                    )}
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

      {/* Detailed Orders Component */}
      <RecentOrders />
    </div>
  );
};

export default Orders;
