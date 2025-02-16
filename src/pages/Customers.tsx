
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Customer } from "@/types/customer";
import CustomerList from "@/components/customers/CustomerList";
import EditCustomerDialog from "@/components/customers/EditCustomerDialog";
import CustomerDetailsDialog from "@/components/customers/CustomerDetailsDialog";

const Customers = () => {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  // Sample data - in a real app, this would come from an API
  const [customers] = useState<Customer[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      rewardPoints: 150,
      orders: [
        {
          id: "#12345",
          date: "2024-03-20",
          items: "Pepperoni Pizza, Coke",
          total: "$24.99",
          pointsEarned: 25
        },
        {
          id: "#12346",
          date: "2024-03-18",
          items: "Hawaiian Pizza, Wings",
          total: "$35.99",
          pointsEarned: 35
        }
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      rewardPoints: 280,
      orders: [
        {
          id: "#12347",
          date: "2024-03-19",
          items: "Margherita Pizza, Garlic Bread",
          total: "$32.50",
          pointsEarned: 30
        }
      ]
    }
  ]);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditedName(customer.name);
    setEditedEmail(customer.email);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (selectedCustomer) {
      toast({
        title: "Customer Updated",
        description: `${selectedCustomer.name}'s information has been updated.`
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerList
            customers={customers}
            onEdit={handleEdit}
            onViewDetails={setSelectedCustomer}
          />
        </CardContent>
      </Card>

      <EditCustomerDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        customer={selectedCustomer}
        editedName={editedName}
        editedEmail={editedEmail}
        onNameChange={setEditedName}
        onEmailChange={setEditedEmail}
        onSave={handleSaveEdit}
      />

      <CustomerDetailsDialog
        open={!!selectedCustomer && !isEditing}
        onOpenChange={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default Customers;
