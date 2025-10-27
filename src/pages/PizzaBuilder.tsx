import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Trash2, Edit, Plus, Power } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PIZZA_SIZES = [
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LARGE', label: 'Large' },
  { value: 'SUPER_SIZE', label: 'Super Size' }
];

const PIZZA_BASES = [
  'Thin Crust',
  'Deep Pan',
  'Stuffed Crust',
  'Classic Crust',
  'Gluten Free'
];

interface Pizza {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface Topping {
  id: string;
  name: string;
  price: number;
  status: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface PizzaBuilderDeal {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  maxToppings: number;
  displayCategoryId: string;
  availableBases: string[];
  availableSizes: string[];
  availableToppings: string[];
  toppingsData?: Record<string, string>; // New field for {id: name} format
  sizePricing: Record<string, number>;
  mediumPrice: number | null;
  largePrice: number | null;
  superSizePrice: number | null;
  isActive: boolean;
  displayCategory?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const PizzaBuilder = () => {
  const { toast } = useToast();
  const [deals, setDeals] = useState<PizzaBuilderDeal[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<PizzaBuilderDeal | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayCategoryId: '',
    maxToppings: 4,
    availableBases: ['Thin Crust', 'Deep Pan', 'Stuffed Crust', 'Classic Crust'] as string[], // All bases available by default
    availableSizes: ['MEDIUM', 'LARGE', 'SUPER_SIZE'] as string[], // All sizes available by default
    availableToppings: [] as string[], // Will store topping names for compatibility
    toppingsData: {} as Record<string, string>, // Store {id: name} format for database
    sizePricing: {}, // Keep for backward compatibility but not used
    mediumPrice: '',
    largePrice: '',
    superSizePrice: '',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    loadData();
    loadToppings();
    loadCategories();
  }, []);

  // Auto-select Pizza category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !formData.displayCategoryId && !editingDeal) {
      const pizzaCategory = categories.find(cat => cat.name.toLowerCase().includes('pizza'));
      if (pizzaCategory) {
        setFormData(prev => ({ ...prev, displayCategoryId: pizzaCategory.id }));
      }
    }
  }, [categories, formData.displayCategoryId, editingDeal]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/pizzaBuilder`);
      setDeals(response.data || []);
    } catch (error) {
      console.error('Error loading pizza builder deals:', error);
      toast({
        title: "Error",
        description: "Failed to load pizza builder deals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadToppings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/getToppings`);
      console.log('Toppings response:', response.data);
      const toppingsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      const activeToppings = toppingsData.filter((t: Topping) => t.status);
      setToppings(activeToppings);
      
      // Auto-select all toppings by default for new deals
      if (!editingDeal && (!Array.isArray(formData.availableToppings) || formData.availableToppings.length === 0)) {
        setFormData(prev => ({
          ...prev,
          availableToppings: activeToppings.map(t => t.name),
          toppingsData: Object.fromEntries(activeToppings.map(t => [t.id, t.name]))
        }));
      }
    } catch (error) {
      console.error('Error loading toppings:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/getCategories`);
      console.log('Categories response:', response.data);
      const categoriesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBaseToggle = (base: string) => {
    setFormData(prev => ({
      ...prev,
      availableBases: prev.availableBases.includes(base)
        ? prev.availableBases.filter(b => b !== base)
        : [...prev.availableBases, base]
    }));
  };

  const handleToppingToggle = (topping: Topping) => {
    // Ensure availableToppings is always an array
    const currentToppings = Array.isArray(formData.availableToppings) ? formData.availableToppings : [];
    const isSelected = currentToppings.includes(topping.name);
    
    if (isSelected) {
      // Remove topping
      setFormData(prev => ({
        ...prev,
        availableToppings: Array.isArray(prev.availableToppings) 
          ? prev.availableToppings.filter(name => name !== topping.name)
          : [],
        toppingsData: Object.fromEntries(
          Object.entries(prev.toppingsData).filter(([id]) => id !== topping.id)
        )
      }));
    } else {
      // Add topping
      setFormData(prev => ({
        ...prev,
        availableToppings: Array.isArray(prev.availableToppings) 
          ? [...prev.availableToppings, topping.name]
          : [topping.name],
        toppingsData: {
          ...prev.toppingsData,
          [topping.id]: topping.name
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.displayCategoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!Array.isArray(formData.availableToppings) || formData.availableToppings.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one topping",
        variant: "destructive"
      });
      return;
    }

    // Validate that at least one price is provided
    if (!formData.mediumPrice && !formData.largePrice && !formData.superSizePrice) {
      toast({
        title: "Validation Error",
        description: "Please provide at least one size price",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('displayCategoryId', formData.displayCategoryId);
      submitData.append('maxToppings', formData.maxToppings.toString());
      submitData.append('availableBases', JSON.stringify(formData.availableBases));
      submitData.append('availableSizes', JSON.stringify(formData.availableSizes));
      // Remove availableToppings - now using toppingsData instead
      submitData.append('toppingsData', JSON.stringify(formData.toppingsData)); // Send {id: name} format
      
      // DEBUG: Log what we're sending
      console.log('=== FRONTEND DEBUG ===');
      console.log('formData.toppingsData:', formData.toppingsData);
      console.log('JSON.stringify(formData.toppingsData):', JSON.stringify(formData.toppingsData));
      console.log('formData.availableToppings (should not be used):', formData.availableToppings);
      console.log('=== END FRONTEND DEBUG ===');
      
      // Add individual price fields
      if (formData.mediumPrice) {
        submitData.append('mediumPrice', formData.mediumPrice);
      }
      if (formData.largePrice) {
        submitData.append('largePrice', formData.largePrice);
      }
      if (formData.superSizePrice) {
        submitData.append('superSizePrice', formData.superSizePrice);
      }
      
      submitData.append('isActive', formData.isActive.toString());
      
      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      if (editingDeal) {
        await axios.put(`${API_URL}/api/admin/pizzaBuilder/${editingDeal.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Success",
          description: "Pizza builder deal updated successfully"
        });
      } else {
        await axios.post(`${API_URL}/api/admin/pizzaBuilder`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Success",
          description: "Pizza builder deal created successfully"
        });
      }

      loadData();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving deal:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save pizza builder deal",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (deal: PizzaBuilderDeal) => {
    setEditingDeal(deal);
    
    // Ensure availableToppings is always an array
    let availableToppingsArray: string[] = [];
    if (Array.isArray(deal.availableToppings)) {
      availableToppingsArray = deal.availableToppings;
    } else if (deal.availableToppings && typeof deal.availableToppings === 'object') {
      // If it's an object, extract the values
      availableToppingsArray = Object.values(deal.availableToppings);
    } else if (typeof deal.availableToppings === 'string') {
      // If it's a string, try to parse it
      try {
        const parsed = JSON.parse(deal.availableToppings);
        availableToppingsArray = Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        availableToppingsArray = [];
      }
    }
    
    // Build toppingsData - prefer existing toppingsData if available, otherwise convert from availableToppings
    let toppingsDataMap: Record<string, string> = {};
    
    if (deal.toppingsData && typeof deal.toppingsData === 'object') {
      // Use existing toppingsData if available
      toppingsDataMap = deal.toppingsData;
    } else {
      // Convert from old availableToppings format
      availableToppingsArray.forEach(toppingName => {
        const toppingObj = toppings.find(t => t.name === toppingName);
        if (toppingObj) {
          toppingsDataMap[toppingObj.id] = toppingObj.name;
        }
      });
    }
    
    setFormData({
      name: deal.name,
      description: deal.description || '',
      displayCategoryId: deal.displayCategoryId,
      maxToppings: deal.maxToppings,
      availableBases: Array.isArray(deal.availableBases) ? deal.availableBases : [],
      availableSizes: Array.isArray(deal.availableSizes) ? deal.availableSizes : [],
      availableToppings: availableToppingsArray,
      toppingsData: toppingsDataMap,
      sizePricing: deal.sizePricing,
      mediumPrice: deal.mediumPrice?.toString() || '',
      largePrice: deal.largePrice?.toString() || '',
      superSizePrice: deal.superSizePrice?.toString() || '',
      isActive: deal.isActive
    });
    setImagePreview(deal.imageUrl ? `${API_URL}/images/${deal.imageUrl}` : '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/admin/pizzaBuilder/${id}`);
      toast({
        title: "Success",
        description: "Pizza builder deal deleted successfully"
      });
      loadData();
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: "Error",
        description: "Failed to delete pizza builder deal",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (deal: PizzaBuilderDeal) => {
    try {
      await axios.patch(`${API_URL}/api/admin/pizzaBuilder/${deal.id}/toggle-status`);
      toast({
        title: "Success",
        description: `Pizza builder deal ${deal.isActive ? 'deactivated' : 'activated'} successfully`
      });
      loadData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Error",
        description: "Failed to toggle pizza builder deal status",
        variant: "destructive"
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDeal(null);
    const pizzaCategory = categories.find(cat => cat.name.toLowerCase().includes('pizza'));
    setFormData({
      name: '',
      description: '',
      displayCategoryId: pizzaCategory?.id || '',
      maxToppings: 4,
      availableBases: ['Thin Crust', 'Deep Pan', 'Stuffed Crust', 'Classic Crust'],
      availableSizes: ['MEDIUM', 'LARGE', 'SUPER_SIZE'], // All sizes by default
      availableToppings: toppings.map(t => t.name), // All toppings by default
      toppingsData: Object.fromEntries(toppings.map(t => [t.id, t.name])), // All toppings {id: name}
      sizePricing: {},
      mediumPrice: '',
      largePrice: '',
      superSizePrice: '',
      isActive: true
    });
    setSelectedFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pizza Builder Deals</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDeal ? 'Edit' : 'Create'} Pizza Builder Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Deal Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Pizza with 4 Toppings"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the deal..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Display Category *</Label>
                    <Select value={formData.displayCategoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, displayCategoryId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxToppings">Max Toppings</Label>
                    <Input
                      id="maxToppings"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.maxToppings}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxToppings: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Deal Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-cover rounded" />
                  )}
                </div>

                {/* Pricing Section */}
                <div>
                  <Label>Size Pricing *</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="mediumPrice" className="text-sm">Medium Price (£)</Label>
                      <Input
                        id="mediumPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.mediumPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, mediumPrice: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="largePrice" className="text-sm">Large Price (£)</Label>
                      <Input
                        id="largePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.largePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, largePrice: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="superSizePrice" className="text-sm">Super Size Price (£)</Label>
                      <Input
                        id="superSizePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.superSizePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, superSizePrice: e.target.value }))}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Provide at least one size price</p>
                </div>
              </div>



              {/* Available Toppings */}
              <div>
                <Label>Available Toppings *</Label>
                <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto border p-3 rounded">
                  {toppings.map((topping) => (
                    <div key={topping.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`topping-${topping.id}`}
                        checked={Array.isArray(formData.availableToppings) && formData.availableToppings.includes(topping.name)}
                        onCheckedChange={() => handleToppingToggle(topping)}
                      />
                      <label htmlFor={`topping-${topping.id}`} className="text-sm cursor-pointer">
                        {topping.name}
                      </label>
                    </div>
                  ))}
                </div>
                
                {/* Preview of toppingsData format */}
                <div className="mt-3">
                  <Label className="text-sm text-gray-600">Preview (Database Format):</Label>
                  <Textarea
                    value={JSON.stringify(formData.toppingsData, null, 2)}
                    readOnly
                    className="mt-1 text-xs bg-gray-50 max-h-32"
                    placeholder="Selected toppings will appear here in {id: name} format"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Saving...' : (editingDeal ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map((deal) => (
          <Card key={deal.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{deal.name}</CardTitle>
                  <Badge variant={deal.isActive ? "default" : "secondary"} className="mt-1">
                    {deal.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(deal)}
                    title={deal.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power className={`h-4 w-4 ${deal.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(deal)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Pizza Builder Deal</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{deal.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(deal.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {deal.imageUrl && (
                <img
                  src={`${API_URL}/images/${deal.imageUrl}`}
                  alt={deal.name}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}
              <p className="text-sm text-gray-600 mb-2">{deal.description}</p>
              <div className="space-y-1 text-sm">
                <p><strong>Category:</strong> {deal.displayCategory?.name}</p>
                <p><strong>Max Toppings:</strong> {deal.maxToppings}</p>
                <p><strong>Bases:</strong> {deal.availableBases?.length || 0}</p>
                <p><strong>Sizes:</strong> {deal.availableSizes.join(', ')}</p>
                <p><strong>Toppings:</strong> {(() => {
                  if (deal.toppingsData && typeof deal.toppingsData === 'object') {
                    // New format: {id: name, id: name} - show total count
                    const toppingsCount = Object.keys(deal.toppingsData).length;
                    return `${toppingsCount} available toppings`;
                  } else {
                    // Old format: ["name1", "name2"]
                    return `${deal.availableToppings?.length || 0} items (old format)`;
                  }
                })()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {deals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No pizza builder deals yet. Create your first one!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PizzaBuilder;
