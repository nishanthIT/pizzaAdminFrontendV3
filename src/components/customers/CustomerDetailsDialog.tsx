
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Award } from "lucide-react";
// import { Customer } from "@/types/customer";

// interface CustomerDetailsDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   customer: Customer | null;
// }

// const CustomerDetailsDialog = ({
//   open,
//   onOpenChange,
//   customer
// }: CustomerDetailsDialogProps) => {
//   if (!customer) return null;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>Customer Details</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">{customer.name}</h3>
//               <p className="text-sm text-gray-500">{customer.email}</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <Award className="h-5 w-5 text-yellow-500" />
//               <span className="text-lg font-semibold">
//                 {customer.rewardPoints} points
//               </span>
//             </div>
//           </div>

//           <div>
//             <h4 className="text-md font-semibold mb-4">Order History</h4>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Order ID</TableHead>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Items</TableHead>
//                   <TableHead>Total</TableHead>
//                   <TableHead>Points Earned</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {customer.orders.map((order) => (
//                   <TableRow key={order.id}>
//                     <TableCell>{order.id}</TableCell>
//                     <TableCell>{order.date}</TableCell>
//                     <TableCell>{order.items}</TableCell>
//                     <TableCell>{order.total}</TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-1">
//                         <Award className="h-4 w-4 text-yellow-500" />
//                         <span>{order.pointsEarned}</span>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CustomerDetailsDialog;

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, ScrollText, MapPin, Calendar, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any;
  loading?: boolean;
  className?: string;
}

const CustomerDetailsDialog = ({ open, onOpenChange, customer, loading = false, className }: CustomerDetailsDialogProps) => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [addressExpanded, setAddressExpanded] = useState(false);

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Show loading state
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-hidden ${className || ''}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 overflow-y-auto pr-2">
            {/* Customer Info Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
            
            {/* Orders Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!customer) return null;

  // Helper function to safely convert to number
  const toNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to safely format date
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'Unknown date';
    
    try {
      // Handle both full datetime and date-only strings
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Unknown date';
      
      // If it's just a date string (YYYY-MM-DD), show date only
      if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date.toLocaleDateString();
      }
      
      return date.toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  // Helper function to get order total from various possible field names
  const getOrderTotal = (order: any): number => {
    // Handle string format like "£23.89"
    if (order.total && typeof order.total === 'string') {
      const cleanTotal = order.total.replace(/[£$,]/g, '');
      const num = parseFloat(cleanTotal);
      if (!isNaN(num)) return num;
    }
    
    // Try different possible field names for numeric total
    const possibleFields = ['total', 'totalAmount', 'orderTotal', 'price', 'grandTotal'];
    
    for (const field of possibleFields) {
      const value = order[field];
      if (value !== null && value !== undefined) {
        const num = toNumber(value);
        if (num > 0) return num;
      }
    }
    
    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-6xl w-[95vw] h-[95vh] overflow-hidden flex flex-col ${className}`}>
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 pb-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Customer Details - {customer.name || 'Unknown'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="space-y-6 p-1">
            {/* Customer Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-4 text-blue-800 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-600">Name:</span>
                    <span className="text-blue-900 font-semibold">{customer.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-600">Email:</span>
                    <span className="text-blue-900 truncate ml-2 max-w-[200px]" title={customer.email}>
                      {customer.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-600">Phone:</span>
                    <span className="text-blue-900 font-semibold">{customer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-600">Join Date:</span>
                    <span className="text-blue-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Statistics */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold mb-4 text-green-800">Customer Statistics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-600">Reward Points:</span>
                    <Badge variant="secondary" className="bg-green-200 text-green-800 text-sm px-3 py-1">
                      {toNumber(customer.rewardPoints)} pts
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-600">Total Orders:</span>
                    <span className="text-green-900 font-bold text-lg">{toNumber(customer.totalOrders)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-600">Total Spent:</span>
                    <span className="text-green-900 font-bold text-lg">£{toNumber(customer.totalSpent).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-600">Free Meals Earned:</span>
                    <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                      {Math.floor(toNumber(customer.totalSpent) / 10)} meals
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            {customer.addresses && customer.addresses.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => setAddressExpanded(!addressExpanded)}
                  className="w-full p-4 border-b bg-gray-50 rounded-t-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Saved Addresses ({customer.addresses.length})
                    </h3>
                    {addressExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </button>
                {addressExpanded && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.addresses.map((address, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-700">Address {index + 1}</span>
                            {address.isDefault && (
                              <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-medium">{address.street || 'N/A'}</p>
                            <p>{address.city || 'N/A'}, {address.postcode || 'N/A'}</p>
                            {address.instructions && (
                              <p className="text-xs italic text-gray-500 mt-2 p-2 bg-yellow-50 rounded border-l-2 border-yellow-300">
                                <strong>Instructions:</strong> {address.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orders Section - Main Scrollable Area */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b bg-gray-50 rounded-t-lg sticky top-0 z-5">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <ScrollText className="h-5 w-5 mr-2" />
                  Order History ({customer.orders?.length || 0})
                </h3>
              </div>
              
              {customer.orders && customer.orders.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="divide-y divide-gray-200">
                    {customer.orders.map((order, index) => {
                      const orderId = order.id || `order-${index}`;
                      const isExpanded = expandedOrders.has(orderId);
                      
                      return (
                        <div key={orderId} className="transition-colors">
                          {/* Order Header - Always Visible */}
                          <button
                            onClick={() => toggleOrderExpansion(orderId)}
                            className="w-full p-6 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                              <div className="flex-1 mb-2 sm:mb-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h4 className="font-bold text-gray-900 text-lg">
                                    Order #{order.orderNumber || order.id || `${index + 1}`}
                                  </h4>
                                  <Badge 
                                    variant={
                                      order.status === 'DELIVERED' ? 'default' : 
                                      order.status === 'PREPARING' ? 'secondary' : 
                                      order.status === 'OUT_FOR_DELIVERY' ? 'outline' : 'outline'
                                    }
                                    className={`text-xs ${
                                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                      order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' :
                                      order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {order.status || 'Unknown'}
                                  </Badge>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-gray-600 ml-auto" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-600 ml-auto" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(order.date || order.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-2xl text-green-600">
                                  £{getOrderTotal(order).toFixed(2)}
                                </p>
                                {order.pointsEarned && (
                                  <p className="text-sm text-blue-600 font-medium">
                                    +{toNumber(order.pointsEarned)} pts earned
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                          
                          {/* Order Details - Collapsible */}
                          {isExpanded && (
                            <div className="px-6 pb-6 space-y-4 bg-gray-50">
                          {/* Items - Handle both array format and string format */}
                          {order.items && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Order Items
                              </p>
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                {Array.isArray(order.items) ? (
                                  <div className="space-y-2">
                                    {order.items.map((item, itemIndex) => (
                                      <div key={itemIndex} className="flex justify-between items-center text-sm bg-white rounded p-3 border border-blue-100">
                                        <div className="flex-1">
                                          <span className="font-medium text-gray-900">
                                            {item.name || 'Unknown Item'}
                                          </span>
                                          {item.size && (
                                            <span className="text-gray-500 ml-2">({item.size})</span>
                                          )}
                                          {toNumber(item.quantity) > 1 && (
                                            <span className="text-blue-600 ml-2 font-semibold">x{toNumber(item.quantity)}</span>
                                          )}
                                        </div>
                                        <span className="font-bold text-gray-900">
                                          £{(toNumber(item.price) * toNumber(item.quantity)).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm bg-white rounded p-3 border border-blue-100">
                                    <span className="font-medium text-gray-900">{order.items}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Delivery Information */}
                          {(order.deliveryMethod || order.deliveryAddress || order.pickupTime) && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Delivery Information
                              </p>
                              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="space-y-2 text-sm">
                                  {order.deliveryMethod && (
                                    <div className="flex items-center">
                                      <span className="font-medium text-green-700 mr-2">Method:</span>
                                      <Badge 
                                        variant="outline" 
                                        className={`${
                                          order.deliveryMethod === 'delivery' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-300' 
                                            : 'bg-orange-50 text-orange-700 border-orange-300'
                                        }`}
                                      >
                                        {order.deliveryMethod.charAt(0).toUpperCase() + order.deliveryMethod.slice(1)}
                                      </Badge>
                                    </div>
                                  )}
                                  {order.deliveryAddress && (
                                    <div>
                                      <span className="font-medium text-green-700">Delivery Address:</span>
                                      <p className="text-gray-800 mt-1 p-2 bg-white rounded border">{order.deliveryAddress}</p>
                                    </div>
                                  )}
                                  {order.pickupTime && (
                                    <div>
                                      <span className="font-medium text-green-700">Pickup Time:</span>
                                      <span className="text-gray-800 ml-2">{order.pickupTime}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Combo Style Items - Only show if array format */}
                          {order.comboStyleItems && Array.isArray(order.comboStyleItems) && order.comboStyleItems.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                Combo Style Items ({order.comboStyleItems.length})
                              </p>
                              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <div className="space-y-2">
                                  {order.comboStyleItems.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex justify-between items-center text-sm bg-white rounded p-3 border border-orange-100">
                                      <div className="flex-1">
                                        <span className="font-medium text-gray-900">
                                          {item.comboStyleItem?.name || item.name || 'Unknown Combo Item'}
                                        </span>
                                        {item.size && (
                                          <span className="text-gray-500 ml-2">({item.size})</span>
                                        )}
                                        {toNumber(item.quantity) > 1 && (
                                          <span className="text-orange-600 ml-2 font-semibold">x{toNumber(item.quantity)}</span>
                                        )}
                                      </div>
                                      <span className="font-bold text-gray-900">
                                        £{(toNumber(item.price) * toNumber(item.quantity)).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Combos */}
                          {order.combos && Array.isArray(order.combos) && order.combos.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Combos ({order.combos.length})
                              </p>
                              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <div className="space-y-2">
                                  {order.combos.map((combo, comboIndex) => (
                                    <div key={comboIndex} className="flex justify-between items-center text-sm bg-white rounded p-3 border border-purple-100">
                                      <div className="flex-1">
                                        <span className="font-medium text-gray-900">
                                          {combo.combo?.name || combo.name || 'Unknown Combo'}
                                        </span>
                                        {toNumber(combo.quantity) > 1 && (
                                          <span className="text-purple-600 ml-2 font-semibold">x{toNumber(combo.quantity)}</span>
                                        )}
                                      </div>
                                      <span className="font-bold text-gray-900">
                                        £{(toNumber(combo.price) * toNumber(combo.quantity)).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          </div>
                          )}
                        
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <ScrollText className="h-16 w-16 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium text-lg">No orders found</p>
                  <p className="text-gray-400 text-sm mt-1">This customer hasn't placed any orders yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;