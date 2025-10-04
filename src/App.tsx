import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Customers from "./pages/Customers";
import Toppings from "./pages/Toppings";
import Ingredients from "./pages/Ingredients";
import Pizzas from "./pages/Pizzas";
import Combos from "./pages/Combos";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import OtherItems from "./pages/OtherItems";
import ComboStyleItems from "./pages/ComboStyleItems";
import UserChoices from "./pages/UserChoices";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <div className="flex">
                      <Sidebar />
                      {/* Updated main content container with proper spacing */}
                      <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8 ml-0 lg:ml-64">
                        {/* <div className="max-w-[calc(100vw-16rem)] mx-auto"> */}
                        <div className=" mx-auto">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route
                              path="/orders/:id"
                              element={<OrderDetails />}
                            />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/toppings" element={<Toppings />} />
                            <Route
                              path="/ingredients"
                              element={<Ingredients />}
                            />
                            <Route path="/pizzas" element={<Pizzas />} />
                            <Route path="/combos" element={<Combos />} />
                            <Route
                              path="/categories"
                              element={<Categories />}
                            />
                            <Route
                              path="/other-items"
                              element={<OtherItems />}
                            />
                            <Route
                              path="/combo-style-items"
                              element={<ComboStyleItems />}
                            />
                            <Route
                              path="/user-choices"
                              element={<UserChoices />}
                            />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
