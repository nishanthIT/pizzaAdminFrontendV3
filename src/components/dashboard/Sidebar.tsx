
import { useState } from "react";
import { Menu, X, Home, ShoppingBag, Users, Settings, Pizza } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: ShoppingBag, label: "Orders", href: "/orders" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: Pizza, label: "Toppings", href: "/toppings" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static w-64 z-40`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Pizza Admin</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-primary hover:text-white transition-all duration-200"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
