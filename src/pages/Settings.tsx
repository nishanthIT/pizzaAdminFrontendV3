import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Settings as SettingsIcon, Truck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";

interface DeliveryZone {
  id: string;
  name: string;
  minDistance: number;
  maxDistance: number;
  charge: number;
  isActive: boolean;
  sortOrder: number;
}

interface DeliverySettings {
  id: string;
  maxDeliveryDistance: number;
  isDeliveryEnabled: boolean;
  shopAddress?: string;
  shopLatitude?: number;
  shopLongitude?: number;
  shopName?: string;
  shopPhone?: string;
}

const Settings = () => {
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState<DeliveryZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [zoneFormData, setZoneFormData] = useState({
    name: "",
    minDistance: "",
    maxDistance: "",
    charge: "",
    isActive: true,
    sortOrder: ""
  });

  // Fetch delivery zones and settings
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch delivery zones
      const zonesResponse = await fetch('/api/admin/delivery/zones', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (zonesResponse.ok) {
        const zones = await zonesResponse.json();
        setDeliveryZones(zones);
      }
      
      // Fetch delivery settings
      const settingsResponse = await fetch('/api/admin/delivery/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        setDeliverySettings(settings);
      }
      
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle zone form submission
  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zoneFormData.name || !zoneFormData.minDistance || !zoneFormData.maxDistance || !zoneFormData.charge) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(zoneFormData.minDistance) >= parseFloat(zoneFormData.maxDistance)) {
      toast({
        title: "Error", 
        description: "Minimum distance must be less than maximum distance",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const url = currentZone 
        ? `/api/admin/delivery/zones/${currentZone.id}`
        : '/api/admin/delivery/zones';
      
      const method = currentZone ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: zoneFormData.name,
          minDistance: parseFloat(zoneFormData.minDistance),
          maxDistance: parseFloat(zoneFormData.maxDistance), 
          charge: parseFloat(zoneFormData.charge),
          isActive: zoneFormData.isActive,
          sortOrder: parseInt(zoneFormData.sortOrder) || 0
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Delivery zone ${currentZone ? 'updated' : 'created'} successfully`,
        });
        
        setIsZoneDialogOpen(false);
        resetZoneForm();
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save zone');
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save delivery zone",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle zone deletion
  const handleDeleteZone = async () => {
    if (!currentZone) return;

    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/delivery/zones/${currentZone.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Delivery zone deleted successfully",
        });
        
        setIsDeleteDialogOpen(false);
        setCurrentZone(null);
        fetchData();
      } else {
        throw new Error('Failed to delete zone');
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete delivery zone",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle delivery settings update
  const handleSettingsUpdate = async (field: keyof DeliverySettings, value: any) => {
    if (!deliverySettings) return;

    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/delivery/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          [field]: value
        })
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setDeliverySettings(updatedSettings);
        
        toast({
          title: "Success",
          description: "Delivery settings updated successfully",
        });
      } else {
        throw new Error('Failed to update settings');
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset zone form
  const resetZoneForm = () => {
    setZoneFormData({
      name: "",
      minDistance: "",
      maxDistance: "",
      charge: "",
      isActive: true,
      sortOrder: ""
    });
    setCurrentZone(null);
  };

  // Open zone dialog for editing
  const openZoneDialog = (zone?: DeliveryZone) => {
    if (zone) {
      setCurrentZone(zone);
      setZoneFormData({
        name: zone.name,
        minDistance: zone.minDistance.toString(),
        maxDistance: zone.maxDistance.toString(),
        charge: zone.charge.toString(),
        isActive: zone.isActive,
        sortOrder: zone.sortOrder.toString()
      });
    } else {
      resetZoneForm();
    }
    setIsZoneDialogOpen(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage delivery zones and settings</p>
        </div>
      </div>

      {/* Shop Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Shop Information
          </CardTitle>
          <CardDescription>
            Configure your restaurant's basic information and location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Restaurant Name</Label>
              <Input
                id="shopName"
                value={deliverySettings?.shopName ?? ""}
                onChange={(e) => handleSettingsUpdate('shopName', e.target.value)}
                disabled={saving}
                placeholder="Enter restaurant name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shopPhone">Contact Phone</Label>
              <Input
                id="shopPhone"
                value={deliverySettings?.shopPhone ?? ""}
                onChange={(e) => handleSettingsUpdate('shopPhone', e.target.value)}
                disabled={saving}
                placeholder="e.g., 020 1234 5678"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shopAddress">Restaurant Address</Label>
            <Input
              id="shopAddress"
              value={deliverySettings?.shopAddress ?? ""}
              onChange={(e) => handleSettingsUpdate('shopAddress', e.target.value)}
              disabled={saving}
              placeholder="Enter full restaurant address"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shopLatitude">Latitude</Label>
              <Input
                id="shopLatitude"
                type="number"
                step="any"
                value={deliverySettings?.shopLatitude ?? ""}
                onChange={(e) => handleSettingsUpdate('shopLatitude', parseFloat(e.target.value))}
                disabled={saving}
                placeholder="e.g., 51.3818739"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shopLongitude">Longitude</Label>
              <Input
                id="shopLongitude"
                type="number"
                step="any"
                value={deliverySettings?.shopLongitude ?? ""}
                onChange={(e) => handleSettingsUpdate('shopLongitude', parseFloat(e.target.value))}
                disabled={saving}
                placeholder="e.g., -0.0692967"
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>💡 Tip: You can get coordinates by searching your address on Google Maps, right-clicking on the location, and selecting "What's here?"</p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Settings
          </CardTitle>
          <CardDescription>
            Configure general delivery settings for your restaurant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Delivery</Label>
              <p className="text-sm text-muted-foreground">
                Turn delivery service on or off
              </p>
            </div>
            <Switch
              checked={deliverySettings?.isDeliveryEnabled ?? true}
              onCheckedChange={(checked) => handleSettingsUpdate('isDeliveryEnabled', checked)}
              disabled={saving}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxDistance">Maximum Delivery Distance (miles)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="maxDistance"
                type="number"
                step="0.1"
                min="0"
                value={deliverySettings?.maxDeliveryDistance ?? 4}
                onChange={(e) => handleSettingsUpdate('maxDeliveryDistance', parseFloat(e.target.value))}
                disabled={saving}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">miles</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Zones Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Zones</CardTitle>
              <CardDescription>
                Manage delivery zones and pricing
              </CardDescription>
            </div>
            <Button onClick={() => openZoneDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Zone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              Delivery zones define pricing based on distance from restaurant
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Distance Range</TableHead>
                <TableHead>Charge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryZones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>
                    {zone.minDistance}-{zone.maxDistance} miles
                  </TableCell>
                  <TableCell>£{zone.charge.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      zone.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{zone.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openZoneDialog(zone)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentZone(zone);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Zone Dialog */}
      <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentZone ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleZoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zoneName">Zone Name *</Label>
              <Input
                id="zoneName"
                value={zoneFormData.name}
                onChange={(e) => setZoneFormData({ ...zoneFormData, name: e.target.value })}
                placeholder="e.g., Zone 1 (0-2 miles)"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDistance">Min Distance (miles) *</Label>
                <Input
                  id="minDistance"
                  type="number"
                  step="0.1"
                  min="0"
                  value={zoneFormData.minDistance}
                  onChange={(e) => setZoneFormData({ ...zoneFormData, minDistance: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDistance">Max Distance (miles) *</Label>
                <Input
                  id="maxDistance"
                  type="number"
                  step="0.1"
                  min="0"
                  value={zoneFormData.maxDistance}
                  onChange={(e) => setZoneFormData({ ...zoneFormData, maxDistance: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="charge">Delivery Charge (£) *</Label>
              <Input
                id="charge"
                type="number"
                step="0.01"
                min="0"
                value={zoneFormData.charge}
                onChange={(e) => setZoneFormData({ ...zoneFormData, charge: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={zoneFormData.sortOrder}
                onChange={(e) => setZoneFormData({ ...zoneFormData, sortOrder: e.target.value })}
                placeholder="0"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={zoneFormData.isActive}
                onCheckedChange={(checked) => setZoneFormData({ ...zoneFormData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsZoneDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : currentZone ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Delivery Zone</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete "{currentZone?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteZone}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;