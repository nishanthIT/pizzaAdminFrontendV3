import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Home,
  ShoppingBag,
  Users,
  Settings,
  Pizza,
  Carrot,
  Utensils,
  Ticket,
  LogOut,
  Gift,
  ChefHat,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth < 1024 // Only on mobile/tablet
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: ShoppingBag, label: "Orders", href: "/orders" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: Pizza, label: "Categories", href: "/categories" },
    { icon: Pizza, label: "Toppings", href: "/toppings" },
    { icon: Carrot, label: "Ingredients", href: "/ingredients" },
    { icon: Utensils, label: "Pizzas", href: "/pizzas" },
    { icon: Ticket, label: "Combos & Offers", href: "/combos" },
    { icon: Gift, label: "Other Items", href: "/other-items" },
    { icon: ChefHat, label: "Combo Style Items", href: "/combo-style-items" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white border-b lg:hidden">
        <h1 className="text-xl font-bold">Pizza Admin</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Pizza Admin</h2>
        </div>
        
        {/* Scrollable navigation area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-primary hover:text-white"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
