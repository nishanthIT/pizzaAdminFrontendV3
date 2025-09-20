import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  onStatusChange: (newStatus: string) => void;
}

const OrderStatusSelect = ({
  orderId,
  currentStatus,
  onStatusChange,
}: OrderStatusSelectProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/api/admin/changeOrderStatus/${orderId}`, {
        status: newStatus,
      });

      if (response.status === 200) {
        onStatusChange(newStatus);
        toast.success("Order status updated successfully");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[130px]" onClick={(e) => e.stopPropagation()}>
        <SelectValue>
          <Badge
            variant={
              currentStatus === "DELIVERED"
                ? "default"
                : currentStatus === "CANCELLED"
                ? "destructive"
                : "secondary"
            }
          >
            {currentStatus}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">PENDING</SelectItem>
        <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
        <SelectItem value="DELIVERED">DELIVERED</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default OrderStatusSelect;
