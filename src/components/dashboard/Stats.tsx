
import { DollarSign, ShoppingCart, Clock, TrendingUp } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      icon: DollarSign,
      label: "Today's Revenue",
      value: "$2,405",
      trend: "+12.5%",
    },
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: "45",
      trend: "+8.2%",
    },
    {
      icon: Clock,
      label: "Pending Orders",
      value: "5",
      trend: "-2.4%",
    },
    {
      icon: TrendingUp,
      label: "Average Order",
      value: "$48.50",
      trend: "+4.7%",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat) => (
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
          <h3 className="text-sm text-gray-500 font-medium">{stat.label}</h3>
          <p className="text-2xl font-semibold text-gray-800 mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default Stats;
