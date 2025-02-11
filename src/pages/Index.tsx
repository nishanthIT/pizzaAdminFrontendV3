
import Sidebar from "@/components/dashboard/Sidebar";
import Stats from "@/components/dashboard/Stats";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentOrders from "@/components/dashboard/RecentOrders";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8">
          <Stats />
          <RevenueChart />
          <RecentOrders />
        </main>
      </div>
    </div>
  );
};

export default Index;
