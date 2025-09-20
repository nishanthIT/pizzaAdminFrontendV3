
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/services/api";

interface RevenueData {
  time: string;
  revenue: number;
}

const RevenueChart = () => {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await api.get('/api/admin/dashboard/revenue');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        // Fallback to mock data
        setData([
          { time: "00:00", revenue: 1200 },
          { time: "03:00", revenue: 800 },
          { time: "06:00", revenue: 1500 },
          { time: "09:00", revenue: 2100 },
          { time: "12:00", revenue: 1800 },
          { time: "15:00", revenue: 2400 },
          { time: "18:00", revenue: 3100 },
          { time: "21:00", revenue: 2900 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Revenue</h2>
        <div className="h-[300px] w-full animate-pulse bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Revenue</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#9b87f5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280" }}
              tickFormatter={(value) => `£${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#9b87f5"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
