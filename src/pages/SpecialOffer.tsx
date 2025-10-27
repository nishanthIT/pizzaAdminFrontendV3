import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import axios from '../lib/axios';

interface SpecialOfferData {
  id?: string;
  title: string;
  offerText: string;
  price: string;
  description: string;
  orderUrl: string;
  isActive: boolean;
}

const SpecialOffer = () => {
  const [offer, setOffer] = useState<SpecialOfferData>({
    title: '',
    offerText: '',
    price: '',
    description: '',
    orderUrl: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { toast } = useToast();

  // Fetch existing special offer data
  useEffect(() => {
    const fetchSpecialOffer = async () => {
      try {
        const response = await axios.get('/api/admin/special-offer');
        if (response.data && response.data.data) {
          setOffer(response.data.data);
        }
      } catch (error) {
        console.log('No existing special offer found or error fetching:', error);
        // Don't show error toast as this might be first time setup
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSpecialOffer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!offer.title || !offer.offerText || !offer.price) {
        toast({
          title: 'Validation Error',
          description: 'Title, Offer Text, and Price are required fields',
          variant: 'destructive',
        });
        return;
      }

      // Clean the price input (remove any non-numeric characters except decimal point)
      const cleanPrice = offer.price.replace(/[^\d.]/g, '');
      
      const offerData = {
        ...offer,
        price: cleanPrice,
      };

      let response;
      if (offer.id) {
        // Update existing offer
        response = await axios.put(`/api/admin/special-offer/${offer.id}`, offerData);
      } else {
        // Create new offer
        response = await axios.post('/api/admin/special-offer', offerData);
      }

      if (response.data.success) {
        toast({
          title: 'Success',
          description: offer.id ? 'Special offer updated successfully!' : 'Special offer created successfully!',
        });
        
        // Update local state with the returned data
        if (response.data.data) {
          setOffer(response.data.data);
        }
      } else {
        throw new Error(response.data.message || 'Failed to save special offer');
      }
    } catch (error: any) {
      console.error('Error saving special offer:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save special offer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SpecialOfferData, value: string | boolean) => {
    setOffer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Special Offer Management</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Special Offer Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure Special Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Offer Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Buy Any 2 Pizzas"
                  value={offer.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">This will appear as the main heading</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerText">Offer Text *</Label>
                <Input
                  id="offerText"
                  placeholder="e.g., Buy Any 2"
                  value={offer.offerText}
                  onChange={(e) => handleInputChange('offerText', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">Text that appears in the offer badge</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  placeholder="e.g., 15.95"
                  value={offer.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">Price without currency symbol (£ will be added automatically)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderUrl">Order URL</Label>
                <Input
                  id="orderUrl"
                  placeholder="e.g., /menu-pizza or external URL"
                  value={offer.orderUrl}
                  onChange={(e) => handleInputChange('orderUrl', e.target.value)}
                />
                <p className="text-sm text-gray-500">Where the "Order Now" button should redirect (leave empty to use default)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Coming soon... or offer details"
                value={offer.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
              <p className="text-sm text-gray-500">Additional description or details about the offer</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={offer.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
              <p className="text-sm text-gray-500">Show this offer on the homepage</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (offer.id ? 'Update Offer' : 'Create Offer')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialOffer;