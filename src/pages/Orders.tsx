
import RecentOrders from "@/components/dashboard/RecentOrders";

const Orders = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
      <RecentOrders />
    </div>
  );
};

export default Orders;
