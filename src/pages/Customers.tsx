
// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useToast } from "@/components/ui/use-toast";
// import { Customer } from "@/types/customer";
// import CustomerList from "@/components/customers/CustomerList";
// import EditCustomerDialog from "@/components/customers/EditCustomerDialog";
// import CustomerDetailsDialog from "@/components/customers/CustomerDetailsDialog";

// const Customers = () => {
//   const { toast } = useToast();
//   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedName, setEditedName] = useState("");
//   const [editedEmail, setEditedEmail] = useState("");

//   // Sample data - in a real app, this would come from an API
//   const [customers] = useState<Customer[]>([
//     {
//       id: 1,
//       name: "John Doe",
//       email: "john@example.com",
//       rewardPoints: 150,
//       orders: [
//         {
//           id: "#12345",
//           date: "2024-03-20",
//           items: "Pepperoni Pizza, Coke",
//           total: "$24.99",
//           pointsEarned: 25
//         },
//         {
//           id: "#12346",
//           date: "2024-03-18",
//           items: "Hawaiian Pizza, Wings",
//           total: "$35.99",
//           pointsEarned: 35
//         }
//       ]
//     },
//     {
//       id: 2,
//       name: "Jane Smith",
//       email: "jane@example.com",
//       rewardPoints: 280,
//       orders: [
//         {
//           id: "#12347",
//           date: "2024-03-19",
//           items: "Margherita Pizza, Garlic Bread",
//           total: "$32.50",
//           pointsEarned: 30
//         }
//       ]
//     }
//   ]);

//   const handleEdit = (customer: Customer) => {
//     setSelectedCustomer(customer);
//     setEditedName(customer.name);
//     setEditedEmail(customer.email);
//     setIsEditing(true);
//   };

//   const handleSaveEdit = () => {
//     if (selectedCustomer) {
//       toast({
//         title: "Customer Updated",
//         description: `${selectedCustomer.name}'s information has been updated.`
//       });
//       setIsEditing(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Customers</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <CustomerList
//             customers={customers}
//             onEdit={handleEdit}
//             onViewDetails={setSelectedCustomer}
//           />
//         </CardContent>
//       </Card>

//       <EditCustomerDialog
//         open={isEditing}
//         onOpenChange={setIsEditing}
//         customer={selectedCustomer}
//         editedName={editedName}
//         editedEmail={editedEmail}
//         onNameChange={setEditedName}
//         onEmailChange={setEditedEmail}
//         onSave={handleSaveEdit}
//       />

//       <CustomerDetailsDialog
//         open={!!selectedCustomer && !isEditing}
//         onOpenChange={() => setSelectedCustomer(null)}
//         customer={selectedCustomer}
//       />
//     </div>
//   );
// };

// export default Customers;


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import CustomerList from "@/components/customers/CustomerList";
import EditCustomerDialog from "@/components/customers/EditCustomerDialog";
import CustomerDetailsDialog from "@/components/customers/CustomerDetailsDialog";

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/customers`, {
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
      } else {
        throw new Error(data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customers: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditedName(customer.name);
    setEditedEmail(customer.email);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editedName,
          email: editedEmail
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Customer Updated",
          description: `${editedName}'s information has been updated.`
        });
        setIsEditing(false);
        fetchCustomers();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (customer) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/customers/${customer.id}`, {
        credentials: "include"
      });

      const data = await response.json();

      if (data.success) {
        setSelectedCustomer(data.customer);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customer details: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="text-lg text-center">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6 min-h-screen">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">
            Customers ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            <div className="space-y-4 p-4">
              {customers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No customers found</p>
                </div>
              ) : (
                customers.map((customer) => (
                  <Card key={customer.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {customer.name}
                            </h3>
                            <p className="text-xs text-gray-600 truncate">
                              {customer.phone}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {customer.rewardPoints} pts
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Orders:</span>
                            <span className="ml-1 font-medium">{customer.totalOrders}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Spent:</span>
                            <span className="ml-1 font-medium">£{customer.totalSpent?.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Meals:</span>
                            <span className="ml-1 font-medium">{Math.floor(customer.totalSpent / 10)}</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Joined: {new Date(customer.joinDate).toLocaleDateString()}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleViewDetails(customer)}
                            className="flex-1 bg-blue-500 text-white text-xs py-2 px-3 rounded hover:bg-blue-600 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="flex-1 bg-gray-500 text-white text-xs py-2 px-3 rounded hover:bg-gray-600 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-semibold text-sm">Name</th>
                    <th className="text-left p-3 font-semibold text-sm">Phone</th>
                    <th className="text-left p-3 font-semibold text-sm hidden lg:table-cell">Email</th>
                    <th className="text-left p-3 font-semibold text-sm">Points</th>
                    <th className="text-left p-3 font-semibold text-sm hidden xl:table-cell">Orders</th>
                    <th className="text-left p-3 font-semibold text-sm hidden xl:table-cell">Spent</th>
                    <th className="text-left p-3 font-semibold text-sm hidden lg:table-cell">Join Date</th>
                    <th className="text-left p-3 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium text-sm truncate max-w-[150px]">
                            {customer.name}
                          </div>
                        </td>
                        <td className="p-3 text-sm">{customer.phone}</td>
                        <td className="p-3 text-sm hidden lg:table-cell">
                          <div className="truncate max-w-[200px]">{customer.email}</div>
                        </td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {customer.rewardPoints} pts
                          </span>
                        </td>
                        <td className="p-3 text-sm hidden xl:table-cell">{customer.totalOrders}</td>
                        <td className="p-3 text-sm hidden xl:table-cell">£{customer.totalSpent?.toFixed(2)}</td>
                        <td className="p-3 text-sm hidden lg:table-cell">
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            {Math.floor(customer.totalSpent / 10)} meals
                          </span>
                        </td>
                        <td className="p-3 text-sm hidden lg:table-cell">
                          {new Date(customer.joinDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(customer)}
                              className="bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="bg-gray-500 text-white text-xs py-1 px-2 rounded hover:bg-gray-600 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Responsive Edit Dialog */}
      <EditCustomerDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        customer={selectedCustomer}
        editedName={editedName}
        editedEmail={editedEmail}
        onNameChange={setEditedName}
        onEmailChange={setEditedEmail}
        onSave={handleSaveEdit}
        className="sm:max-w-[425px] max-w-[95vw] mx-auto"
      />

      {/* Mobile-Responsive Details Dialog */}
      <CustomerDetailsDialog
        open={!!selectedCustomer && !isEditing}
        onOpenChange={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        className="sm:max-w-[600px] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto"
      />
    </div>
  );
};

export default Customers;
