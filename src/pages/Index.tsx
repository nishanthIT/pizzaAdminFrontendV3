
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Stats from "@/components/dashboard/Stats";
import RevenueChart from "@/components/dashboard/RevenueChart";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Show loading or nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your pizza admin dashboard</p>
      </div>
      <Stats />
      <RevenueChart />
    </div>
  );
};

export default Index;
