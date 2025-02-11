
import { useState } from "react";

const RecentOrders = () => {
  const [orders] = useState([
    {
      id: "#12345",
      customer: "John Doe",
      items: "Pepperoni Pizza, Coke",
      total: "$24.99",
      status: "Delivered",
    },
    {
      id: "#12346",
      customer: "Jane Smith",
      items: "Margherita Pizza, Garlic Bread",
      total: "$32.50",
      status: "Preparing",
    },
    {
      id: "#12347",
      customer: "Mike Johnson",
      items: "Hawaiian Pizza, Wings",
      total: "$41.75",
      status: "In Transit",
    },
    {
      id: "#12348",
      customer: "Sarah Williams",
      items: "Vegetarian Pizza",
      total: "$18.99",
      status: "Delivered",
    },
  ]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Order ID
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Items
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Total
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-800">{order.id}</td>
                <td className="py-3 px-4 text-sm text-gray-800">
                  {order.customer}
                </td>
                <td className="py-3 px-4 text-sm text-gray-800">{order.items}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{order.total}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Preparing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
