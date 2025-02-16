
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  editedName: string;
  editedEmail: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onSave: () => void;
}

const EditCustomerDialog = ({
  open,
  onOpenChange,
  editedName,
  editedEmail,
  onNameChange,
  onEmailChange,
  onSave
}: EditCustomerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label>Name</label>
            <Input
              value={editedName}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label>Email</label>
            <Input
              value={editedEmail}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
          <Button onClick={onSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;
