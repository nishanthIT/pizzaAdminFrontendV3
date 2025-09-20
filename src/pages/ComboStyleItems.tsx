

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
import { Trash2, Edit, Plus, X } from 'lucide-react';
import { comboStyleItemService } from '../services/comboStyleItemService';
import { categoryService } from '../services/categoryService';
import { useToast } from '../hooks/use-toast';

interface ComboStyleItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  sizePricing: Record<string, {
    basePrice: number;
    mealDealPrice: number;
  }> | any;
  mealDealConfig?: Record<string, {
    sides?: {
      categoryId: string;
      count: number;
    };
    drinks?: {
      categoryId: string;
      count: number;
    };
  }> | any;
  availableSauces?: string[] | any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MealDealCategory {
  categoryId: string;
  count: number;
}

interface SizeConfig {
  name: string;
  basePrice: number;
  mealDealPrice: number;
  sides: MealDealCategory[];
  drinks: MealDealCategory[];
}

const ComboStyleItems = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ComboStyleItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ComboStyleItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // New sauce input states
  const [newSauceInput, setNewSauceInput] = useState('');
  const [isAddingSauce, setIsAddingSauce] = useState(false);
  
  // Delete confirmation state
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  
  // Form state - removed sidesCategoryId and drinksCategoryId
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    sizes: [] as SizeConfig[],
    sauces: [] as string[],
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
      const itemsRes = await comboStyleItemService.getAll();
      console.log('🔧 Raw API response:', itemsRes);
      
      // Process the data to ensure proper structure
      const processedItems = (itemsRes.data || []).map(item => {
        console.log('🔧 Processing item:', item.name, 'sizePricing type:', typeof item.sizePricing, 'value:', item.sizePricing);
        
        let sizePricing = {};
        if (Array.isArray(item.sizePricing)) {
          sizePricing = item.sizePricing;
        } else if (typeof item.sizePricing === 'string') {
          try {
            sizePricing = JSON.parse(item.sizePricing);
          } catch (e) {
            console.error('Failed to parse sizePricing string:', item.sizePricing);
            sizePricing = {};
          }
        } else if (item.sizePricing && typeof item.sizePricing === 'object') {
          sizePricing = item.sizePricing;
        }
        
        let availableSauces = [];
        if (Array.isArray(item.availableSauces)) {
          availableSauces = item.availableSauces;
        } else if (typeof item.availableSauces === 'string') {
          try {
            availableSauces = JSON.parse(item.availableSauces);
          } catch (e) {
            console.error('Failed to parse availableSauces string:', item.availableSauces);
            availableSauces = [];
          }
        } else if (item.availableSauces && typeof item.availableSauces === 'object') {
          availableSauces = item.availableSauces;
        }

        return {
          ...item,
          sizePricing: sizePricing,
          availableSauces: Array.isArray(availableSauces) ? availableSauces : []
        };
      });
      
      console.log('🔧 Processed items:', processedItems);
      setItems(processedItems);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load combo style items",
        variant: "destructive"
      });
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

  // Add size configuration
  const addSize = () => {
    console.log('🔧 Adding new size with empty fields');
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { 
        name: '',
        basePrice: 0,
        mealDealPrice: 0,
        sides: [],
        drinks: []
      }]
    }));
  };

  // Remove size configuration
  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  // Update size configuration
  const updateSize = (index: number, field: keyof SizeConfig, value: string | number | MealDealCategory[]) => {
    console.log('🔧 Updating size:', index, field, value);
    setFormData(prev => {
      const newSizes = prev.sizes.map((size, i) => {
        if (i === index) {
          let updatedValue = value;
          if (field !== 'name' && field !== 'sides' && field !== 'drinks') {
            updatedValue = value === '' ? 0 : Number(value);
          }
          return { ...size, [field]: updatedValue };
        }
        return size;
      });
      console.log('🔧 New sizes array:', newSizes);
      return {
        ...prev,
        sizes: newSizes
      };
    });
  };

  // Add meal deal category (sides or drinks)
  const addMealDealCategory = (sizeIndex: number, type: 'sides' | 'drinks') => {
    const newCategory: MealDealCategory = {
      categoryId: '',
      count: 1
    };
    
    setFormData(prev => {
      const newSizes = [...prev.sizes];
      newSizes[sizeIndex] = {
        ...newSizes[sizeIndex],
        [type]: [...newSizes[sizeIndex][type], newCategory]
      };
      return {
        ...prev,
        sizes: newSizes
      };
    });
  };

  // Remove meal deal category
  const removeMealDealCategory = (sizeIndex: number, type: 'sides' | 'drinks', categoryIndex: number) => {
    setFormData(prev => {
      const newSizes = [...prev.sizes];
      newSizes[sizeIndex] = {
        ...newSizes[sizeIndex],
        [type]: newSizes[sizeIndex][type].filter((_, i) => i !== categoryIndex)
      };
      return {
        ...prev,
        sizes: newSizes
      };
    });
  };

  // Update meal deal category
  const updateMealDealCategory = (sizeIndex: number, type: 'sides' | 'drinks', categoryIndex: number, field: 'categoryId' | 'count', value: string | number) => {
    setFormData(prev => {
      const newSizes = [...prev.sizes];
      const updatedCategories = [...newSizes[sizeIndex][type]];
      updatedCategories[categoryIndex] = {
        ...updatedCategories[categoryIndex],
        [field]: field === 'count' ? Number(value) : value
      };
      newSizes[sizeIndex] = {
        ...newSizes[sizeIndex],
        [type]: updatedCategories
      };
      return {
        ...prev,
        sizes: newSizes
      };
    });
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      sizes: [],
      sauces: [],
      isActive: true
    });
    setEditingItem(null);
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

  // Handle opening dialog for new item
  const handleAddNewItem = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Handle opening dialog for editing
const handleEditItem = (item: ComboStyleItem) => {
  console.log('🔧 Editing item:', item);
  console.log('🔧 Item mealDealConfig:', item.mealDealConfig);
  
  // Convert sizePricing object to sizes array
  const sizesArray = item.sizePricing && typeof item.sizePricing === 'object' ? 
    Object.entries(item.sizePricing).map(([sizeName, sizeData]: [string, any]) => {
      // FIXED: Use the same transformation logic for consistency
      const normalizedSizeName = sizeName.toLowerCase().replace(/\s+/g, '');
      const mealDealInfo = item.mealDealConfig?.[normalizedSizeName] || item.mealDealConfig?.[sizeName] || {};
      
      console.log('🔧 Size:', sizeName, 'normalized:', normalizedSizeName, 'mealDealInfo:', mealDealInfo);
      
      // Build sides array
      const sides = [];
      if (mealDealInfo.sides && mealDealInfo.sides.categoryId) {
        sides.push({
          categoryId: mealDealInfo.sides.categoryId,
          count: mealDealInfo.sides.count || 1
        });
      }
      
      // Build drinks array  
      const drinks = [];
      if (mealDealInfo.drinks && mealDealInfo.drinks.categoryId) {
        drinks.push({
          categoryId: mealDealInfo.drinks.categoryId,
          count: mealDealInfo.drinks.count || 1
        });
      }
      
      return {
        name: sizeName, // Keep original name for display
        basePrice: sizeData.basePrice || sizeData.price || 0,
        mealDealPrice: sizeData.mealDealPrice || sizeData.dealPrice || sizeData.basePrice || sizeData.price || 0,
        sides: sides,
        drinks: drinks
      };
    }) : [];

  console.log('🔧 Converted sizes array:', sizesArray);

  setFormData({
    name: item.name || '',
    description: item.description || '',
    categoryId: item.categoryId || '',
    sizes: sizesArray,
    sauces: Array.isArray(item.availableSauces) ? item.availableSauces : [],
    isActive: item.isActive
  });
  
  setEditingItem(item);
  setIsDialogOpen(true);
};

  // Handle delete
  const handleDeleteItem = async (id: string) => {
    try {
      await comboStyleItemService.delete(id);
      toast({
        title: "Success",
        description: "Combo style item deleted successfully"
      });
      setDeletingItem(null);
      await loadData();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete combo style item",
        variant: "destructive"
      });
    }
  };

  // Handle form submission with better validation
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log('🔧 Form submission started with data:', formData);
  
  if (!formData.name.trim()) {
    toast({
      title: "Error",
      description: "Item name is required",
      variant: "destructive"
    });
    return;
  }

  // Enhanced category validation
  if (!formData.categoryId || formData.categoryId.trim() === '' || formData.categoryId === 'loading') {
    toast({
      title: "Error", 
      description: "Please select a valid category",
      variant: "destructive"
    });
    return;
  }

  if (formData.sizes.length === 0) {
    toast({
      title: "Error",
      description: "At least one size configuration is required",
      variant: "destructive"
    });
    return;
  }

  // Validate sizes
  const hasEmptySize = formData.sizes.some(size => !size.name.trim() || size.basePrice <= 0);
  if (hasEmptySize) {
    toast({
      title: "Error",
      description: "All sizes must have a name and base price greater than 0",
      variant: "destructive"
    });
    return;
  }

  try {
    setUploading(true);

    // Transform sizes array into the expected object format for database
    const sizePricingObject: Record<string, any> = {};
    const mealDealConfigObject: Record<string, any> = {};
    
    formData.sizes.forEach((size, index) => {
      // IMPROVED: Better size name handling
      const originalSizeName = size.name.trim();
      const sizeName = originalSizeName.toLowerCase().replace(/\s+/g, '');
      
      console.log(`🔧 Processing size ${index}:`, {
        original: originalSizeName,
        normalized: sizeName,
        sides: size.sides,
        drinks: size.drinks
      });
      
      sizePricingObject[sizeName] = {
        basePrice: parseFloat(size.basePrice.toString()),
        mealDealPrice: parseFloat(size.mealDealPrice.toString()) || parseFloat(size.basePrice.toString())
      };
      
      // IMPROVED: Build meal deal config with better validation
      const mealDealInfo: any = {};
      
      // Add sides configuration
      if (size.sides && size.sides.length > 0) {
        const validSides = size.sides.filter(s => s.categoryId && s.categoryId.trim() !== '');
        console.log(`🔧 Valid sides for ${sizeName}:`, validSides);
        if (validSides.length > 0) {
          mealDealInfo.sides = {
            categoryId: validSides[0].categoryId,
            count: validSides[0].count || 1
          };
          console.log(`🔧 Added sides to ${sizeName}:`, mealDealInfo.sides);
        }
      }
      
      // Add drinks configuration  
      if (size.drinks && size.drinks.length > 0) {
        const validDrinks = size.drinks.filter(d => d.categoryId && d.categoryId.trim() !== '');
        console.log(`🔧 Valid drinks for ${sizeName}:`, validDrinks);
        if (validDrinks.length > 0) {
          mealDealInfo.drinks = {
            categoryId: validDrinks[0].categoryId,
            count: validDrinks[0].count || 1
          };
          console.log(`🔧 Added drinks to ${sizeName}:`, mealDealInfo.drinks);
        }
      }
      
      // IMPORTANT: Always add mealDealInfo, even if empty, to ensure updates work
      mealDealConfigObject[sizeName] = mealDealInfo;
      console.log(`🔧 Final mealDealInfo for ${sizeName}:`, mealDealInfo);
    });

    console.log('🔧 Complete sizePricing:', sizePricingObject);
    console.log('🔧 Complete mealDealConfig:', mealDealConfigObject);

    // Create FormData for file upload
    const formDataPayload = new FormData();
    formDataPayload.append('name', formData.name.trim());
    formDataPayload.append('description', formData.description.trim());
    formDataPayload.append('categoryId', formData.categoryId.trim());
    formDataPayload.append('sizePricing', JSON.stringify(sizePricingObject));
    formDataPayload.append('mealDealConfig', JSON.stringify(mealDealConfigObject));
    formDataPayload.append('availableSauces', JSON.stringify(formData.sauces.filter(sauce => sauce.trim())));
    formDataPayload.append('isActive', formData.isActive.toString());
    
    if (selectedFile) {
      formDataPayload.append('image', selectedFile);
    }

    console.log('🔧 FormData being sent:');
    for (let [key, value] of formDataPayload.entries()) {
      console.log(`${key}:`, value);
    }

    let result;
    if (editingItem) {
      console.log('🔧 Updating existing item:', editingItem.id);
      result = await comboStyleItemService.update(editingItem.id, formDataPayload);
      toast({
        title: "Success",
        description: "Combo style item updated successfully"
      });
    } else {
      console.log('🔧 Creating new item');
      result = await comboStyleItemService.create(formDataPayload);
      toast({
        title: "Success", 
        description: "Combo style item created successfully"
      });
    }

    console.log('🔧 API Response:', result);
    resetForm();
    setIsDialogOpen(false);
    await loadData();

  } catch (error: any) {
    console.error('Error saving combo style item:', error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to save combo style item",
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
          <h1 className="text-3xl font-bold">Combo Style Items</h1>
          <p className="text-muted-foreground mb-3">
            Manage combo-style items with dynamic sizing and meal deals
          </p>
          <div className="flex gap-4 text-sm">
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-blue-700 font-medium">{items.length}</span> <span className="text-blue-600">Total Items</span>
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-full">
              <span className="text-green-700 font-medium">{items.filter(item => item.isActive).length}</span> <span className="text-green-600">Active</span>
            </div>
            <div className="bg-gray-50 px-3 py-1 rounded-full">
              <span className="text-gray-700 font-medium">{items.filter(item => !item.isActive).length}</span> <span className="text-gray-600">Inactive</span>
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
            <Button onClick={handleAddNewItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Combo Style Item' : 'Create New Combo Style Item'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => {
                      console.log('🔧 Category selected:', value, 'type:', typeof value);
                      setFormData(prev => ({ ...prev, categoryId: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter item description"
                  rows={3}
                />
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
                {editingItem && editingItem.imageUrl && !imagePreview && (
                  <div className="mt-2">
                    <img
                      src={`${import.meta.env.VITE_API_URL}/api/images/${editingItem.imageUrl}`}
                      alt={editingItem.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Size Configuration */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Size Configuration *</Label>
                  <Button type="button" onClick={addSize} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {formData.sizes.map((size, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm">
                            {size.name ? `${index + 1}. ${size.name}` : `Size ${index + 1} (Empty)`}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSize(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {size.name && size.basePrice > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            £{size.basePrice} → £{size.mealDealPrice || size.basePrice} (meal deal)
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Size Name *</Label>
                          <Input
                            value={size.name || ''}
                            onChange={(e) => updateSize(index, 'name', e.target.value)}
                            placeholder="e.g., Small, Medium, Large"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Normal Price (£)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={size.basePrice || ''}
                              onChange={(e) => updateSize(index, 'basePrice', e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Meal Deal Price (£)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={size.mealDealPrice || ''}
                              onChange={(e) => updateSize(index, 'mealDealPrice', e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {/* Sides Configuration */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Sides Options (when added as meal deal)</Label>
                            <Button
                              type="button"
                              onClick={() => addMealDealCategory(index, 'sides')}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Sides Category
                            </Button>
                          </div>
                          {size.sides.map((sideCategory, sideIndex) => (
                            <div key={sideIndex} className="grid grid-cols-12 gap-2 items-end mb-2">
                              <div className="col-span-8">
                                <Label className="text-xs">Category</Label>
                                <Select
                                  value={sideCategory.categoryId}
                                  onValueChange={(value) => updateMealDealCategory(index, 'sides', sideIndex, 'categoryId', value)}
                                >
                                  <SelectTrigger className="h-8">
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
                              <div className="col-span-3">
                                <Label className="text-xs">Count</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={sideCategory.count || ''}
                                  onChange={(e) => updateMealDealCategory(index, 'sides', sideIndex, 'count', e.target.value)}
                                  placeholder="1"
                                  className="h-8"
                                />
                              </div>
                              <div className="col-span-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMealDealCategory(index, 'sides', sideIndex)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {size.sides.length === 0 && (
                            <div className="text-xs text-gray-500 p-2 border border-dashed rounded">
                              No sides categories added yet. Add categories to allow customers to choose sides with this size.
                            </div>
                          )}
                        </div>

                        {/* Drinks Configuration */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Drinks Options (when added as meal deal)</Label>
                            <Button
                              type="button"
                              onClick={() => addMealDealCategory(index, 'drinks')}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Drinks Category
                            </Button>
                          </div>
                          {size.drinks.map((drinkCategory, drinkIndex) => (
                            <div key={drinkIndex} className="grid grid-cols-12 gap-2 items-end mb-2">
                              <div className="col-span-8">
                                <Label className="text-xs">Category</Label>
                                <Select
                                  value={drinkCategory.categoryId}
                                  onValueChange={(value) => updateMealDealCategory(index, 'drinks', drinkIndex, 'categoryId', value)}
                                >
                                  <SelectTrigger className="h-8">
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
                              <div className="col-span-3">
                                <Label className="text-xs">Count</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={drinkCategory.count || ''}
                                  onChange={(e) => updateMealDealCategory(index, 'drinks', drinkIndex, 'count', e.target.value)}
                                  placeholder="1"
                                  className="h-8"
                                />
                              </div>
                              <div className="col-span-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMealDealCategory(index, 'drinks', drinkIndex)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {size.drinks.length === 0 && (
                            <div className="text-xs text-gray-500 p-2 border border-dashed rounded">
                              No drinks categories added yet. Add categories to allow customers to choose drinks with this size.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {formData.sizes.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm mb-2">
                        {editingItem ? 'No sizes found for this item.' : 'No sizes configured yet.'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Click "Add Size" to add size configurations.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sauce Configuration */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Available Sauces</Label>
                  <Button 
                    type="button" 
                    onClick={() => setIsAddingSauce(true)}
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sauce
                  </Button>
                </div>
                
                {/* Add new sauce input */}
                {isAddingSauce && (
                  <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <Label htmlFor="newSauce" className="text-sm font-medium">
                      Enter sauce name:
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="newSauce"
                        value={newSauceInput}
                        onChange={(e) => setNewSauceInput(e.target.value)}
                        placeholder="e.g., BBQ, Peri Peri Medium, Lemon Herbs"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmedSauce = newSauceInput.trim();
                            if (trimmedSauce && !formData.sauces.includes(trimmedSauce)) {
                              setFormData(prev => ({
                                ...prev,
                                sauces: [...prev.sauces, trimmedSauce]
                              }));
                              setNewSauceInput('');
                              setIsAddingSauce(false);
                            }
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const trimmedSauce = newSauceInput.trim();
                          if (trimmedSauce && !formData.sauces.includes(trimmedSauce)) {
                            setFormData(prev => ({
                              ...prev,
                              sauces: [...prev.sauces, trimmedSauce]
                            }));
                            setNewSauceInput('');
                            setIsAddingSauce(false);
                          }
                        }}
                        disabled={!newSauceInput.trim() || formData.sauces.includes(newSauceInput.trim())}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNewSauceInput('');
                          setIsAddingSauce(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {newSauceInput.trim() && formData.sauces.includes(newSauceInput.trim()) && (
                      <p className="text-sm text-red-500 mt-1">This sauce already exists</p>
                    )}
                  </div>
                )}
                
                {formData.sauces.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 mb-2">
                      Click on a sauce to remove it:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.sauces.map((sauce, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors px-3 py-1"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              sauces: prev.sauces.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          {sauce}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    No sauces added yet. Click "Add Sauce" to add sauce options like BBQ, Peri Peri Medium, Lemon Herbs, etc.
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500">
                  <strong>Popular sauce examples:</strong> BBQ, Peri Peri Medium, Peri Peri Hot, Lemon Herbs, Mango Lime, Extra Hot, Mild, Garlic, Honey Mustard
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
                  {uploading ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.category?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditItem(item)}
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
                        <AlertDialogTitle>Delete Combo Style Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{item.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteItem(item.id)}
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
              {item.imageUrl && (
                <img
                  src={`${import.meta.env.VITE_API_URL}/api/images/${item.imageUrl}`}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              {item.description && (
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              )}
              
              {/* Display sizes */}
              {item.sizePricing && Object.keys(item.sizePricing).length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Available Sizes:</p>
                  <div className="space-y-1">
                    {Object.entries(item.sizePricing).map(([sizeName, pricing]: [string, any]) => (
                      <div key={sizeName} className="flex justify-between text-sm">
                        <span className="capitalize">{sizeName}</span>
                        <span>£{pricing.basePrice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Display sauces */}
              {item.availableSauces && item.availableSauces.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Available Sauces:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.availableSauces.slice(0, 3).map((sauce: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sauce}
                      </Badge>
                    ))}
                    {item.availableSauces.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.availableSauces.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No combo style items yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first combo style item.</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default ComboStyleItems;