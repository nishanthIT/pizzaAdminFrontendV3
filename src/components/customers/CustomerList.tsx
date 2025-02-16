
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Award, User } from "lucide-react";
import { Customer } from "@/types/customer";

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onViewDetails: (customer: Customer) => void;
}

const CustomerList = ({ customers, onEdit, onViewDetails }: CustomerListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Reward Points</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{customer.name}</span>
              </div>
            </TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>{customer.rewardPoints}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(customer)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(customer)}
                >
                  View Details
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CustomerList;
