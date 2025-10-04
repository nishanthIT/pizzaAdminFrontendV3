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
import { Trash2, Edit, Plus, X, Settings } from 'lucide-react';
import { userChoiceService, UserChoice, CategoryConfig } from '../services/userChoiceService';
import { categoryService } from '../services/categoryService';
import { useToast } from '../hooks/use-toast';

const PIZZA_SIZES = [
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'super_size', label: 'Super Size' }
];

const UserChoices = () => {
  const { toast } = useToast();
  const [userChoices, setUserChoices] = useState<UserChoice[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChoice, setEditingChoice] = useState<UserChoice | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayCategoryId: '',
    basePrice: 0,
    categoryConfigs: [] as CategoryConfig[],
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await userChoiceService.getAll();
      console.log('🔧 UserChoices response:', response);
      
      // Handle both direct array and wrapped response
      const choices = Array.isArray(response) ? response : (response.data || []);
      setUserChoices(Array.isArray(choices) ? choices : []);
    } catch (error) {
      console.error('Error loading user choices:', error);
      toast({
        title: "Error",
        description: "Failed to load user choices",
        variant: "destructive"
      });
      setUserChoices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryService.getCategories();
      const validCategories = (response || []).filter(cat => cat && cat.id && cat.id.trim() !== '');
      setCategories(validCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Add category configuration
  const addCategoryConfig = () => {
    setFormData(prev => ({
      ...prev,
      categoryConfigs: [...prev.categoryConfigs, {
        categoryId: '',
        categoryName: '',
        itemCount: 1,
        type: 'other'
      }]
    }));
  };

  // Remove category configuration
  const removeCategoryConfig = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categoryConfigs: prev.categoryConfigs.filter((_, i) => i !== index)
    }));
  };

  // Update category configuration
  const updateCategoryConfig = (index: number, field: keyof CategoryConfig, value: string | number) => {
    setFormData(prev => {
      const newConfigs = prev.categoryConfigs.map((config, i) => {
        if (i === index) {
          const updatedConfig = { ...config, [field]: value };
          
          // When category changes, update the category name
          if (field === 'categoryId') {
            const selectedCategory = categories.find(cat => cat.id === value);
            if (selectedCategory) {
              updatedConfig.categoryName = selectedCategory.name;
            }
          }
          
          // Clear allowedSize when switching from pizza to other
          if (field === 'type' && value === 'other') {
            delete updatedConfig.allowedSize;
          }
          
          return updatedConfig;
        }
        return config;
      });
      
      return {
        ...prev,
        categoryConfigs: newConfigs
      };
    });
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      displayCategoryId: '',
      basePrice: 0,
      categoryConfigs: [],
      isActive: true
    });
    setEditingChoice(null);
    setSelectedFile(null);
    setImagePreview("");
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle opening dialog for new choice
  const handleAddNewChoice = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Handle opening dialog for editing
  const handleEditChoice = (choice: UserChoice) => {
    console.log('🔧 Editing choice:', choice);
    
    setFormData({
      name: choice.name || '',
      description: choice.description || '',
      displayCategoryId: choice.displayCategoryId || '',
      basePrice: parseFloat(choice.basePrice) || 0,
      categoryConfigs: Array.isArray(choice.categoryConfigs) ? choice.categoryConfigs : [],
      isActive: choice.isActive
    });
    
    setEditingChoice(choice);
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDeleteChoice = async (id: string) => {
    try {
      await userChoiceService.delete(id);
      toast({
        title: "Success",
        description: "User choice deleted successfully"
      });
      await loadData();
    } catch (error: any) {
      console.error('Error deleting choice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user choice",
        variant: "destructive"
      });
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (id: string, newActiveStatus: boolean) => {
    try {
      // Find the choice to get its current data
      const choice = userChoices.find(c => c.id === id);
      if (!choice) return;

      // Create form data for the update
      const formData = new FormData();
      formData.append('name', choice.name);
      formData.append('description', choice.description || '');
      formData.append('displayCategoryId', choice.displayCategoryId);
      formData.append('basePrice', choice.basePrice.toString());
      formData.append('categoryConfigs', JSON.stringify(choice.categoryConfigs));
      formData.append('isActive', newActiveStatus.toString());

      await userChoiceService.update(id, formData);
      
      toast({
        title: "Success",
        description: `User choice ${newActiveStatus ? 'activated' : 'deactivated'} successfully`
      });
      await loadData();
    } catch (error: any) {
      console.error('Error toggling choice active status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user choice status",
        variant: "destructive"
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔧 Form submission started with data:', formData);
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Choice name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.displayCategoryId || formData.displayCategoryId.trim() === '') {
      toast({
        title: "Error", 
        description: "Please select a display category",
        variant: "destructive"
      });
      return;
    }

    if (formData.basePrice <= 0) {
      toast({
        title: "Error",
        description: "Base price must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (formData.categoryConfigs.length === 0) {
      toast({
        title: "Error",
        description: "At least one category configuration is required",
        variant: "destructive"
      });
      return;
    }

    // Validate category configurations
    const hasInvalidConfig = formData.categoryConfigs.some(config => 
      !config.categoryId || !config.categoryName || config.itemCount <= 0
    );
    
    if (hasInvalidConfig) {
      toast({
        title: "Error",
        description: "All category configurations must have valid category and item count",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Create FormData for file upload
      const formDataPayload = new FormData();
      formDataPayload.append('name', formData.name.trim());
      formDataPayload.append('description', formData.description.trim());
      formDataPayload.append('displayCategoryId', formData.displayCategoryId.trim());
      formDataPayload.append('basePrice', formData.basePrice.toString());
      formDataPayload.append('categoryConfigs', JSON.stringify(formData.categoryConfigs));
      formDataPayload.append('isActive', formData.isActive.toString());
      
      if (selectedFile) {
        formDataPayload.append('image', selectedFile);
      }

      console.log('🔧 FormData being sent:');
      for (let [key, value] of formDataPayload.entries()) {
        console.log(`${key}:`, value);
      }

      let result;
      if (editingChoice) {
        console.log('🔧 Updating existing choice:', editingChoice.id);
        result = await userChoiceService.update(editingChoice.id, formDataPayload);
        toast({
          title: "Success",
          description: "User choice updated successfully"
        });
      } else {
        console.log('🔧 Creating new choice');
        result = await userChoiceService.create(formDataPayload);
        toast({
          title: "Success", 
          description: "User choice created successfully"
        });
      }

      console.log('🔧 API Response:', result);
      resetForm();
      setIsDialogOpen(false);
      await loadData();

    } catch (error: any) {
      console.error('Error saving user choice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save user choice",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Choice Configurations</h1>
          <p className="text-muted-foreground mb-3">
            Create flexible meal deals where users can choose from multiple categories
          </p>
          <div className="flex gap-4 text-sm">
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-blue-700 font-medium">{userChoices.length}</span> <span className="text-blue-600">Total Choices</span>
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-full">
              <span className="text-green-700 font-medium">{userChoices.filter(choice => choice.isActive).length}</span> <span className="text-green-600">Active</span>
            </div>
            <div className="bg-gray-50 px-3 py-1 rounded-full">
              <span className="text-gray-700 font-medium">{userChoices.filter(choice => !choice.isActive).length}</span> <span className="text-gray-600">Inactive</span>
            </div>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNewChoice}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Choice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingChoice ? 'Edit User Choice' : 'Create New User Choice'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Choice Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Build Your Meal Deal"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price (£) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    placeholder="12.99"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="displayCategory">Display Under Category *</Label>
                <Select
                  value={formData.displayCategoryId}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, displayCategoryId: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category where this choice will appear" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Loading categories...
                        </div>
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    ) : (
                      categories
                        .filter(category => category && category.id && category.id.trim() !== '')
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what users can choose in this meal deal"
                  rows={2}
                />
              </div>

              {/* Active Status Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Display on homepage (Active)
                </Label>
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                {editingChoice && editingChoice.imageUrl && !imagePreview && (
                  <div className="mt-2">
                    <img
                      src={`${import.meta.env.VITE_API_URL}/api/images/${editingChoice.imageUrl}`}
                      alt={editingChoice.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Category Configurations */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Category Configurations *</Label>
                  <Button type="button" onClick={addCategoryConfig} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {formData.categoryConfigs.map((config, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm">
                            {config.categoryName ? `${index + 1}. ${config.categoryName}` : `Configuration ${index + 1}`}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCategoryConfig(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Category *</Label>
                            <Select
                              value={config.categoryId}
                              onValueChange={(value) => updateCategoryConfig(index, 'categoryId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories
                                  .filter(category => category && category.id && category.id.trim() !== '')
                                  .map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Type *</Label>
                            <Select
                              value={config.type}
                              onValueChange={(value) => updateCategoryConfig(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pizza">Pizza (with size selection)</SelectItem>
                                <SelectItem value="other">Other Items</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Number of Items Users Can Select *</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={config.itemCount || ''}
                              onChange={(e) => updateCategoryConfig(index, 'itemCount', parseInt(e.target.value) || 1)}
                              placeholder="1"
                            />
                          </div>
                          {config.type === 'pizza' && (
                            <div>
                              <Label>Allowed Pizza Size *</Label>
                              <Select
                                value={config.allowedSize || ''}
                                onValueChange={(value) => updateCategoryConfig(index, 'allowedSize', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pizza size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PIZZA_SIZES.map((size) => (
                                    <SelectItem key={size.value} value={size.value}>
                                      {size.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {config.categoryId && config.itemCount && (
                          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                            Users will choose {config.itemCount} {config.type === 'pizza' ? 'pizza(s)' : 'item(s)'} from {config.categoryName}
                            {config.type === 'pizza' && config.allowedSize && ` (${PIZZA_SIZES.find(s => s.value === config.allowedSize)?.label} size only)`}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {formData.categoryConfigs.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Settings className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm mb-2">No category configurations yet</p>
                      <p className="text-gray-400 text-xs">Click "Add Category" to configure what users can choose</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Saving...' : (editingChoice ? 'Update Choice' : 'Create Choice')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Choices Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userChoices.map((choice) => (
          <Card key={choice.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{choice.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {choice.displayCategory?.name} • £{parseFloat(choice.basePrice || '0').toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditChoice(choice)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User Choice</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{choice.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteChoice(choice.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {choice.imageUrl && (
                <img
                  src={`${import.meta.env.VITE_API_URL}/api/images/${choice.imageUrl}`}
                  alt={choice.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              {choice.description && (
                <p className="text-sm text-gray-600 mb-4">{choice.description}</p>
              )}
              
              {/* Display category configurations */}
              {choice.categoryConfigs && Array.isArray(choice.categoryConfigs) && choice.categoryConfigs.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">User can choose:</p>
                  <div className="space-y-1">
                    {choice.categoryConfigs.map((config: any, index: number) => (
                      <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">{config.itemCount}x</span> from{' '}
                        <span className="font-medium">{config.categoryName}</span>
                        {config.type === 'pizza' && config.allowedSize && (
                          <span className="text-xs text-blue-600 ml-1">
                            ({PIZZA_SIZES.find(s => s.value === config.allowedSize)?.label} only)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <Badge variant={choice.isActive ? "default" : "secondary"}>
                  {choice.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(choice.id, !choice.isActive)}
                  className={choice.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                >
                  {choice.isActive ? "Hide from Homepage" : "Show on Homepage"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {userChoices.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No user choices yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first flexible meal choice.</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Choice
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserChoices;