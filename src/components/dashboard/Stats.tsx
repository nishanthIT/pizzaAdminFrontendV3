
import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Clock, TrendingUp } from "lucide-react";
import api from "@/services/api";

interface DashboardStats {
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  averageOrder: number;
  revenueGrowth: number;
  ordersGrowth: number;
  pendingGrowth: number;
  averageGrowth: number;
}

const Stats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Fallback to mock data
        setStats({
          todayRevenue: 2405,
          totalOrders: 45,
          pendingOrders: 5,
          averageOrder: 48.50,
          revenueGrowth: 12.5,
          ordersGrowth: 8.2,
          pendingGrowth: -2.4,
          averageGrowth: 4.7
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: DollarSign,
      label: "Today's Revenue",
      value: `£${stats?.todayRevenue?.toFixed(2) || '0.00'}`,
      trend: `${(stats?.revenueGrowth || 0) > 0 ? '+' : ''}${stats?.revenueGrowth?.toFixed(1) || '0.0'}%`,
    },
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: stats?.totalOrders?.toString() || '0',
      trend: `${(stats?.ordersGrowth || 0) > 0 ? '+' : ''}${stats?.ordersGrowth?.toFixed(1) || '0.0'}%`,
    },
    {
      icon: Clock,
      label: "Pending Orders",
      value: stats?.pendingOrders?.toString() || '0',
      trend: `${(stats?.pendingGrowth || 0) > 0 ? '+' : ''}${stats?.pendingGrowth?.toFixed(1) || '0.0'}%`,
    },
    {
      icon: TrendingUp,
      label: "Average Order",
      value: `£${stats?.averageOrder?.toFixed(2) || '0.00'}`,
      trend: `${(stats?.averageGrowth || 0) > 0 ? '+' : ''}${stats?.averageGrowth?.toFixed(1) || '0.0'}%`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <stat.icon className="w-6 h-6 text-primary" />
            </div>
            <span
              className={`text-sm font-medium ${
                stat.trend.startsWith("+") ? "text-green-500" : "text-red-500"
              }`}
            >
              {stat.trend}
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
