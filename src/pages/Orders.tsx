
// // import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import RecentOrders from "@/components/dashboard/RecentOrders";
// // import {
// //   Table,
// //   TableBody,
// //   TableCaption,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { MapPin, ShoppingBag, Phone, RefreshCw } from "lucide-react";
// // import { Badge } from "@/components/ui/badge";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import OrderStatusSelect from "@/components/custom/OrderStatusSelect";
// // import { Loading } from "@/components/ui/loading";
// // import api from "@/services/api";

// // interface OrderContactInfo {
// //   address?: string;
// //   phone: string;
// //   type: "delivery" | "pickup";
// // }

// // interface Order {
// //   id: string;
// //   customerName: string;
// //   createdAt: string;
// //   status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
// //   deliveryMethod: string;
// //   deliveryAddress?: string;
// //   totalAmount: number;
// //   user: {
// //     phone: string;
// //   };
// // }

// // const Orders = () => {
// //   const navigate = useNavigate();
// //   const [orders, setOrders] = useState<Order[]>([]);
// //   const [contactInfo, setContactInfo] = useState<OrderContactInfo | null>(null);
// //   const [showContactInfo, setShowContactInfo] = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [error, setError] = useState<string | null>(null);

// //   const fetchOrders = async (showRefreshLoader = false) => {
// //     try {
// //       if (showRefreshLoader) {
// //         setRefreshing(true);
// //       } else {
// //         setLoading(true);
// //       }
// //       setError(null);

// //       // Use the correct API endpoint
// //       const response = await api.get("/getAllOrders");
      
// //       if (response.data) {
// //         setOrders(response.data);
// //       } else {
// //         setOrders([]);
// //       }
// //     } catch (error: any) {
// //       console.error("Error fetching orders:", error);
      
// //       // More detailed error handling
// //       if (error.response) {
// //         // Server responded with error status
// //         if (error.response.status === 401) {
// //           setError("Authentication failed. Please login again.");
// //           // Optionally redirect to login
// //           // navigate('/login');
// //         } else if (error.response.status === 403) {
// //           setError("Access denied. Insufficient permissions.");
// //         } else {
// //           setError(`Server error: ${error.response.status}`);
// //         }
// //       } else if (error.request) {
// //         // Request was made but no response received
// //         setError("Network error. Please check your connection.");
// //       } else {
// //         // Something else happened
// //         setError("An unexpected error occurred.");
// //       }
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchOrders();
// //   }, []);

// //   const handleRefresh = () => {
// //     fetchOrders(true);
// //   };

// //   const handleTypeClick = (
// //     type: "delivery" | "pickup",
// //     address?: string,
// //     phone?: string
// //   ) => {
// //     if (phone) {
// //       setContactInfo({
// //         type,
// //         address,
// //         phone,
// //       });
// //       setShowContactInfo(true);
// //     }
// //   };

// //   const handleOrderClick = (orderId: string) => {
// //     navigate(`/orders/${orderId}`);
// //   };

// //   const handleStatusChange = (orderId: string, newStatus: string) => {
// //     setOrders(prevOrders =>
// //       prevOrders.map((order) =>
// //         order.id === orderId
// //           ? { ...order, status: newStatus as Order["status"] }
// //           : order
// //       )
// //     );
// //   };

// //   if (loading) {
// //     return <Loading message="Loading orders..." />;
// //   }

// //   if (error) {
// //     return (
// //       <div className="space-y-8">
// //         <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
// //         <div className="flex flex-col items-center justify-center py-12 space-y-4">
// //           <div className="text-center">
// //             <h3 className="text-lg font-medium text-gray-900 mb-2">
// //               Failed to load orders
// //             </h3>
// //             <p className="text-gray-500 mb-4">{error}</p>
// //             <Button onClick={() => fetchOrders()} disabled={refreshing}>
// //               {refreshing ? (
// //                 <div className="flex items-center">
// //                   <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
// //                   Retrying...
// //                 </div>
// //               ) : (
// //                 <div className="flex items-center">
// //                   <RefreshCw className="mr-2 h-4 w-4" />
// //                   Try Again
// //                 </div>
// //               )}
// //             </Button>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-8">
// //       <div className="flex justify-between items-center">
// //         <div>
// //           <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
// //           <p className="text-muted-foreground">
// //             Manage and track all customer orders ({orders.length} orders)
// //           </p>
// //         </div>
// //         <Button 
// //           variant="outline" 
// //           onClick={handleRefresh}
// //           disabled={refreshing}
// //         >
// //           {refreshing ? (
// //             <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
// //           ) : (
// //             <RefreshCw className="mr-2 h-4 w-4" />
// //           )}
// //           Refresh
// //         </Button>
// //       </div>

// //       <div className="rounded-md border bg-white shadow-sm">
// //         <Table>
// //           <TableCaption>
// //             {orders.length === 0 
// //               ? "No orders found" 
// //               : `Showing ${orders.length} order${orders.length !== 1 ? 's' : ''}`
// //             }
// //           </TableCaption>
// //           <TableHeader>
// //             <TableRow>
// //               <TableHead>Order ID</TableHead>
// //               <TableHead>Customer</TableHead>
// //               <TableHead>Phone</TableHead>
// //               <TableHead>Amount</TableHead>
// //               <TableHead>Date</TableHead>
// //               <TableHead>Status</TableHead>
// //               <TableHead>Type</TableHead>
// //             </TableRow>
// //           </TableHeader>
// //           <TableBody>
// //             {orders.length === 0 ? (
// //               <TableRow>
// //                 <TableCell colSpan={7} className="text-center py-8">
// //                   <div className="flex flex-col items-center space-y-2">
// //                     <ShoppingBag className="h-8 w-8 text-gray-400" />
// //                     <p className="text-gray-500">No orders found</p>
// //                     <Button 
// //                       variant="outline" 
// //                       size="sm" 
// //                       onClick={handleRefresh}
// //                       disabled={refreshing}
// //                     >
// //                       {refreshing ? "Refreshing..." : "Refresh"}
// //                     </Button>
// //                   </div>
// //                 </TableCell>
// //               </TableRow>
// //             ) : (
// //               orders.map((order) => (
// //                 <TableRow
// //                   key={order.id}
// //                   className="cursor-pointer hover:bg-gray-50 transition-colors"
// //                   onClick={() => handleOrderClick(order.id)}
// //                 >
// //                   <TableCell className="font-medium">
// //                     #{order.id.slice(-8)}
// //                   </TableCell>
// //                   <TableCell>
// //                     <div className="font-medium">{order.customerName}</div>
// //                   </TableCell>
// //                   <TableCell>
// //                     <div className="flex items-center gap-1">
// //                       <Phone className="h-3 w-3 text-gray-400" />
// //                       {order.user.phone}
// //                     </div>
// //                   </TableCell>
// //                   <TableCell>
// //                     <span className="font-semibold">
// //                       £{Number(order.totalAmount).toFixed(2)}
// //                     </span>
// //                   </TableCell>
// //                   <TableCell>
// //                     <div className="text-sm">
// //                       {new Date(order.createdAt).toLocaleDateString('en-GB', {
// //                         day: '2-digit',
// //                         month: '2-digit', 
// //                         year: 'numeric'
// //                       })}
// //                     </div>
// //                     <div className="text-xs text-gray-500">
// //                       {new Date(order.createdAt).toLocaleTimeString('en-GB', {
// //                         hour: '2-digit',
// //                         minute: '2-digit'
// //                       })}
// //                     </div>
// //                   </TableCell>
// //                   <TableCell onClick={(e) => e.stopPropagation()}>
// //                     <OrderStatusSelect
// //                       orderId={order.id}
// //                       currentStatus={order.status}
// //                       onStatusChange={(newStatus) => 
// //                         handleStatusChange(order.id, newStatus)
// //                       }
// //                     />
// //                   </TableCell>
// //                   <TableCell>
// //                     <Badge
// //                       className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
// //                         order.deliveryMethod === "delivery"
// //                           ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
// //                           : "bg-amber-100 text-amber-800 hover:bg-amber-200"
// //                       }`}
// //                       onClick={(e) => {
// //                         e.stopPropagation();
// //                         handleTypeClick(
// //                           order.deliveryMethod as "delivery" | "pickup",
// //                           order.deliveryAddress,
// //                           order.user.phone
// //                         );
// //                       }}
// //                     >
// //                       {order.deliveryMethod === "delivery" ? (
// //                         <>
// //                           <MapPin className="h-3 w-3" />
// //                           <span>Delivery</span>
// //                         </>
// //                       ) : (
// //                         <>
// //                           <ShoppingBag className="h-3 w-3" />
// //                           <span>Pickup</span>
// //                         </>
// //                       )}
// //                     </Badge>
// //                   </TableCell>
// //                 </TableRow>
// //               ))
// //             )}
// //           </TableBody>
// //         </Table>
// //       </div>

// //       {/* Contact Information Dialog */}
// //       <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
// //         <DialogContent className="sm:max-w-[425px]">
// //           <DialogHeader>
// //             <DialogTitle>
// //               {contactInfo?.type === "delivery"
// //                 ? "Delivery Information"
// //                 : "Pickup Information"}
// //             </DialogTitle>
// //             <DialogDescription>
// //               Contact details for this order.
// //             </DialogDescription>
// //           </DialogHeader>
// //           <div className="space-y-4 py-4">
// //             {contactInfo?.type === "delivery" && contactInfo?.address && (
// //               <div className="flex items-start gap-3">
// //                 <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
// //                 <div className="min-w-0 flex-1">
// //                   <p className="font-medium text-sm text-gray-500 mb-1">
// //                     Delivery Address
// //                   </p>
// //                   <p className="text-gray-900 break-words">{contactInfo.address}</p>
// //                 </div>
// //               </div>
// //             )}
// //             <div className="flex items-start gap-3">
// //               <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
// //               <div className="min-w-0 flex-1">
// //                 <p className="font-medium text-sm text-gray-500 mb-1">
// //                   Contact Number
// //                 </p>
// //                 <p className="text-gray-900">
// //                   <a 
// //                     href={`tel:${contactInfo?.phone}`}
// //                     className="hover:underline text-blue-600"
// //                   >
// //                     {contactInfo?.phone}
// //                   </a>
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </DialogContent>
// //       </Dialog>
// //     </div>
// //   );
// // };

// // export default Orders;  

// import { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import RecentOrders from "@/components/dashboard/RecentOrders";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { MapPin, ShoppingBag, Phone, RefreshCw, Pause, Play } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import OrderStatusSelect from "@/components/custom/OrderStatusSelect";
// import { Loading } from "@/components/ui/loading";
// import api from "@/services/api";

// interface OrderContactInfo {
//   address?: string;
//   phone: string;
//   type: "delivery" | "pickup";
// }

// interface Order {
//   id: string;
//   customerName: string;
//   createdAt: string;
//   status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
//   deliveryMethod: string;
//   deliveryAddress?: string;
//   totalAmount: number;
//   user: {
//     phone: string;
//   };
// }

// const Orders = () => {
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [contactInfo, setContactInfo] = useState<OrderContactInfo | null>(null);
//   const [showContactInfo, setShowContactInfo] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
//   // Use useRef to store the interval ID
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   const fetchOrders = async (showRefreshLoader = false, isAutoRefresh = false) => {
//     try {
//       if (showRefreshLoader && !isAutoRefresh) {
//         setRefreshing(true);
//       } else if (!isAutoRefresh) {
//         setLoading(true);
//       }
//       setError(null);

//       // Use the correct API endpoint
//       const response = await api.get("/getAllOrders");
      
//       if (response.data) {
//         setOrders(response.data);
//         setLastUpdated(new Date());
//       } else {
//         setOrders([]);
//       }
//     } catch (error: any) {
//       console.error("Error fetching orders:", error);
      
//       // More detailed error handling
//       if (error.response) {
//         // Server responded with error status
//         if (error.response.status === 401) {
//           setError("Authentication failed. Please login again.");
//           // Optionally redirect to login
//           // navigate('/login');
//         } else if (error.response.status === 403) {
//           setError("Access denied. Insufficient permissions.");
//         } else {
//           setError(`Server error: ${error.response.status}`);
//         }
//       } else if (error.request) {
//         // Request was made but no response received
//         setError("Network error. Please check your connection.");
//       } else {
//         // Something else happened
//         setError("An unexpected error occurred.");
//       }
      
//       // If it's an auto-refresh error, don't show loading states but log it
//       if (isAutoRefresh) {
//         console.warn("Auto-refresh failed:", error.message);
//       }
//     } finally {
//       if (!isAutoRefresh) {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     }
//   };

//   // Setup auto-refresh interval
//   useEffect(() => {
//     // Initial fetch
//     fetchOrders();

//     // Setup interval for auto-refresh
//     if (autoRefresh) {
//       intervalRef.current = setInterval(() => {
//         fetchOrders(false, true); // isAutoRefresh = true
//       }, 5000); // 5 seconds
//     }

//     // Cleanup function
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, [autoRefresh]);

//   // Toggle auto-refresh
//   const toggleAutoRefresh = () => {
//     setAutoRefresh(prev => {
//       const newValue = !prev;
      
//       if (newValue) {
//         // Starting auto-refresh
//         intervalRef.current = setInterval(() => {
//           fetchOrders(false, true);
//         }, 5000);
//       } else {
//         // Stopping auto-refresh
//         if (intervalRef.current) {
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//         }
//       }
      
//       return newValue;
//     });
//   };

//   const handleRefresh = () => {
//     fetchOrders(true);
//   };

//   const handleTypeClick = (
//     type: "delivery" | "pickup",
//     address?: string,
//     phone?: string
//   ) => {
//     if (phone) {
//       setContactInfo({
//         type,
//         address,
//         phone,
//       });
//       setShowContactInfo(true);
//     }
//   };

//   const handleOrderClick = (orderId: string) => {
//     navigate(`/orders/${orderId}`);
//   };

//   const handleStatusChange = (orderId: string, newStatus: string) => {
//     setOrders(prevOrders =>
//       prevOrders.map((order) =>
//         order.id === orderId
//           ? { ...order, status: newStatus as Order["status"] }
//           : order
//       )
//     );
//   };

//   // Format last updated time
//   const formatLastUpdated = (date: Date | null) => {
//     if (!date) return "";
    
//     const now = new Date();
//     const diffMs = now.getTime() - date.getTime();
//     const diffSeconds = Math.floor(diffMs / 1000);
    
//     if (diffSeconds < 60) return `${diffSeconds}s ago`;
//     if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
//     return date.toLocaleTimeString('en-GB', { 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     });
//   };

//   if (loading) {
//     return <Loading message="Loading orders..." />;
//   }

//   if (error) {
//     return (
//       <div className="space-y-8">
//         <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
//         <div className="flex flex-col items-center justify-center py-12 space-y-4">
//           <div className="text-center">
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               Failed to load orders
//             </h3>
//             <p className="text-gray-500 mb-4">{error}</p>
//             <Button onClick={() => fetchOrders()} disabled={refreshing}>
//               {refreshing ? (
//                 <div className="flex items-center">
//                   <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
//                   Retrying...
//                 </div>
//               ) : (
//                 <div className="flex items-center">
//                   <RefreshCw className="mr-2 h-4 w-4" />
//                   Try Again
//                 </div>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
//           <div className="flex items-center gap-4">
//             <p className="text-muted-foreground">
//               Manage and track all customer orders ({orders.length} orders)
//             </p>
//             {lastUpdated && (
//               <span className="text-xs text-gray-400">
//                 Last updated: {formatLastUpdated(lastUpdated)}
//               </span>
//             )}
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button 
//             variant={autoRefresh ? "default" : "outline"}
//             size="sm"
//             onClick={toggleAutoRefresh}
//           >
//             {autoRefresh ? (
//               <>
//                 <Pause className="mr-2 h-4 w-4" />
//                 Auto-refresh ON
//               </>
//             ) : (
//               <>
//                 <Play className="mr-2 h-4 w-4" />
//                 Auto-refresh OFF
//               </>
//             )}
//           </Button>
//           <Button 
//             variant="outline" 
//             onClick={handleRefresh}
//             disabled={refreshing}
//           >
//             {refreshing ? (
//               <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
//             ) : (
//               <RefreshCw className="mr-2 h-4 w-4" />
//             )}
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {autoRefresh && (
//         <div className="bg-green-50 border border-green-200 rounded-md p-3">
//           <div className="flex items-center">
//             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
//             <span className="text-sm text-green-700">
//               Auto-refreshing every 5 seconds - Orders will update automatically
//             </span>
//           </div>
//         </div>
//       )}

//       <div className="rounded-md border bg-white shadow-sm">
//         <Table>
//           <TableCaption>
//             {orders.length === 0 
//               ? "No orders found" 
//               : `Showing ${orders.length} order${orders.length !== 1 ? 's' : ''}`
//             }
//           </TableCaption>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Order ID</TableHead>
//               <TableHead>Customer</TableHead>
//               <TableHead>Phone</TableHead>
//               <TableHead>Amount</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Type</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {orders.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={7} className="text-center py-8">
//                   <div className="flex flex-col items-center space-y-2">
//                     <ShoppingBag className="h-8 w-8 text-gray-400" />
//                     <p className="text-gray-500">No orders found</p>
//                     <Button 
//                       variant="outline" 
//                       size="sm" 
//                       onClick={handleRefresh}
//                       disabled={refreshing}
//                     >
//                       {refreshing ? "Refreshing..." : "Refresh"}
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ) : (
//               orders.map((order) => (
//                 <TableRow
//                   key={order.id}
//                   className="cursor-pointer hover:bg-gray-50 transition-colors"
//                   onClick={() => handleOrderClick(order.id)}
//                 >
//                   <TableCell className="font-medium">
//                     #{order.id.slice(-8)}
//                   </TableCell>
//                   <TableCell>
//                     <div className="font-medium">{order.customerName}</div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex items-center gap-1">
//                       <Phone className="h-3 w-3 text-gray-400" />
//                       {order.user.phone}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <span className="font-semibold">
//                       £{Number(order.totalAmount).toFixed(2)}
//                     </span>
//                   </TableCell>
//                   <TableCell>
//                     <div className="text-sm">
//                       {new Date(order.createdAt).toLocaleDateString('en-GB', {
//                         day: '2-digit',
//                         month: '2-digit', 
//                         year: 'numeric'
//                       })}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {new Date(order.createdAt).toLocaleTimeString('en-GB', {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })}
//                     </div>
//                   </TableCell>
//                   <TableCell onClick={(e) => e.stopPropagation()}>
//                     <OrderStatusSelect
//                       orderId={order.id}
//                       currentStatus={order.status}
//                       onStatusChange={(newStatus) => 
//                         handleStatusChange(order.id, newStatus)
//                       }
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
//                         order.deliveryMethod === "delivery"
//                           ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
//                           : "bg-amber-100 text-amber-800 hover:bg-amber-200"
//                       }`}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleTypeClick(
//                           order.deliveryMethod as "delivery" | "pickup",
//                           order.deliveryAddress,
//                           order.user.phone
//                         );
//                       }}
//                     >
//                       {order.deliveryMethod === "delivery" ? (
//                         <>
//                           <MapPin className="h-3 w-3" />
//                           <span>Delivery</span>
//                         </>
//                       ) : (
//                         <>
//                           <ShoppingBag className="h-3 w-3" />
//                           <span>Pickup</span>
//                         </>
//                       )}
//                     </Badge>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Contact Information Dialog */}
//       <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>
//               {contactInfo?.type === "delivery"
//                 ? "Delivery Information"
//                 : "Pickup Information"}
//             </DialogTitle>
//             <DialogDescription>
//               Contact details for this order.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             {contactInfo?.type === "delivery" && contactInfo?.address && (
//               <div className="flex items-start gap-3">
//                 <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-sm text-gray-500 mb-1">
//                     Delivery Address
//                   </p>
//                   <p className="text-gray-900 break-words">{contactInfo.address}</p>
//                 </div>
//               </div>
//             )}
//             <div className="flex items-start gap-3">
//               <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
//               <div className="min-w-0 flex-1">
//                 <p className="font-medium text-sm text-gray-500 mb-1">
//                   Contact Number
//                 </p>
//                 <p className="text-gray-900">
//                   <a 
//                     href={`tel:${contactInfo?.phone}`}
//                     className="hover:underline text-blue-600"
//                   >
//                     {contactInfo?.phone}
//                   </a>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default Orders;

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  MapPin, 
  ShoppingBag, 
  Phone, 
  RefreshCw, 
  Pause, 
  Play, 
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import OrderStatusSelect from "@/components/custom/OrderStatusSelect";
import { Loading } from "@/components/ui/loading";
import api from "@/services/api";

interface Order {
  id: string;
  customerName: string;
  createdAt: string;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  deliveryMethod: string;
  deliveryAddress?: string;
  totalAmount: number;
  orderTiming: string;
  preorderDate?: string;
  preorderTime?: string;
  user: {
    phone: string;
  };
}

interface GroupedOrders {
  [key: string]: Order[];
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders>({});
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['today']));
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = async (showRefreshLoader = false, isAutoRefresh = false) => {
    try {
      if (showRefreshLoader && !isAutoRefresh) {
        setRefreshing(true);
      } else if (!isAutoRefresh) {
        setLoading(true);
      }
      setError(null);

      const response = await api.get("/api/admin/getAllOrders"); // Corrected path
      
      if (response.data) {
        setOrders(response.data);
        setLastUpdated(new Date());
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Authentication failed. Please login again.");
        } else if (error.response.status === 403) {
          setError("Access denied. Insufficient permissions.");
        } else {
          setError(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
      
      if (isAutoRefresh) {
        console.warn("Auto-refresh failed:", error.message);
      }
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Filter orders based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.phone.includes(searchTerm)
      );
      setFilteredOrders(filtered);
    }
  }, [orders, searchTerm]);

  // Group orders by day
  useEffect(() => {
    const grouped = filteredOrders.reduce((acc: GroupedOrders, order) => {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      
      let dayKey: string;
      if (orderDate.toDateString() === today.toDateString()) {
        dayKey = 'today';
      } else {
        dayKey = orderDate.toISOString().split('T')[0];
      }
      
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(order);
      
      return acc;
    }, {});

    // Sort orders within each day by creation time (newest first)
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    setGroupedOrders(grouped);
  }, [filteredOrders]);

  // Setup auto-refresh interval
  useEffect(() => {
    fetchOrders();

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchOrders(false, true);
      }, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => {
      const newValue = !prev;
      
      if (newValue) {
        intervalRef.current = setInterval(() => {
          fetchOrders(false, true);
        }, 30000);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
      
      return newValue;
    });
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleTypeClick = (
    type: "delivery" | "pickup",
    address?: string,
    phone?: string
  ) => {
    if (phone) {
      setContactInfo({
        type,
        address,
        phone,
      });
      setShowContactInfo(true);
    }
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prevOrders =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus as Order["status"] }
          : order
      )
    );
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDayLabel = (dayKey: string) => {
    if (dayKey === 'today') return 'Today';
    
    const date = new Date(dayKey);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleDayExpansion = (dayKey: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayKey)) {
        newSet.delete(dayKey);
      } else {
        newSet.add(dayKey);
      }
      return newSet;
    });
  };

  const renderOrderTiming = (order: Order) => {
    if (order.orderTiming === 'preorder' && order.preorderDate && order.preorderTime) {
      const preorderDate = new Date(order.preorderDate);
      const formattedDate = preorderDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      return (
        <div className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3 text-blue-500" />
          <span className="text-blue-600 font-medium">
            {formattedDate} at {order.preorderTime}
          </span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3 text-green-500" />
        <span className="text-green-600 font-medium">ASAP</span>
      </div>
    );
  };

  if (loading) {
    return <Loading message="Loading orders..." />;
  }

  if (error) {
    return (
      <div className="space-y-8 p-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Order Management</h1>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load orders
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => fetchOrders()} disabled={refreshing}>
              {refreshing ? (
                <div className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </div>
              ) : (
                <div className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 p-4">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start md:space-y-0">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Order Management</h1>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              Manage and track all customer orders ({orders.length} orders)
            </p>
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Last updated: {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-2 md:space-y-0">
          <Button 
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
            className="w-full md:w-auto"
          >
            {autoRefresh ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Auto-refresh ON</span>
                <span className="sm:hidden">Auto ON</span>
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Auto-refresh OFF</span>
                <span className="sm:hidden">Auto OFF</span>
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="w-full md:w-auto"
          >
            {refreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, order ID, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-green-700">
              Auto-refreshing every 5 seconds
            </span>
          </div>
        </div>
      )}

      {/* Orders by Day */}
      <div className="space-y-4">
        {Object.keys(groupedOrders).length === 0 ? (
          <div className="text-center py-8 bg-white rounded-md border">
            <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No orders found</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-2"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        ) : (
          Object.entries(groupedOrders)
            .sort(([a], [b]) => {
              if (a === 'today') return -1;
              if (b === 'today') return 1;
              return new Date(b).getTime() - new Date(a).getTime();
            })
            .map(([dayKey, dayOrders]) => (
              <Collapsible 
                key={dayKey} 
                open={expandedDays.has(dayKey)}
                onOpenChange={() => toggleDayExpansion(dayKey)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-4 h-auto bg-gray-50 hover:bg-gray-100 rounded-md border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <h3 className="font-semibold text-base">
                          {formatDayLabel(dayKey)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {dayOrders.length} order{dayOrders.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {expandedDays.has(dayKey) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-2">
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-3">
                    {dayOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="bg-white border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-sm">#{order.id.slice(-8)}</h4>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">£{Number(order.totalAmount).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{order.user.phone}</span>
                        </div>
                        
                        <div className="mb-3">
                          {renderOrderTiming(order)}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                          <Badge
                            className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
                              order.deliveryMethod === "delivery"
                                ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTypeClick(
                                order.deliveryMethod as "delivery" | "pickup",
                                order.deliveryAddress,
                                order.user.phone
                              );
                            }}
                          >
                            {order.deliveryMethod === "delivery" ? (
                              <>
                                <MapPin className="h-3 w-3" />
                                <span>Delivery</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="h-3 w-3" />
                                <span>Pickup</span>
                              </>
                            )}
                          </Badge>
                          
                          <div onClick={(e) => e.stopPropagation()}>
                            <OrderStatusSelect
                              orderId={order.id}
                              currentStatus={order.status}
                              onStatusChange={(newStatus) => 
                                handleStatusChange(order.id, newStatus)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-md border bg-white shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Timing</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dayOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleOrderClick(order.id)}
                          >
                            <TableCell className="font-medium">
                              #{order.id.slice(-8)}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{order.customerName}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                {order.user.phone}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                £{Number(order.totalAmount).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              {renderOrderTiming(order)}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <OrderStatusSelect
                                orderId={order.id}
                                currentStatus={order.status}
                                onStatusChange={(newStatus) => 
                                  handleStatusChange(order.id, newStatus)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
                                  order.deliveryMethod === "delivery"
                                    ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTypeClick(
                                    order.deliveryMethod as "delivery" | "pickup",
                                    order.deliveryAddress,
                                    order.user.phone
                                  );
                                }}
                              >
                                {order.deliveryMethod === "delivery" ? (
                                  <>
                                    <MapPin className="h-3 w-3" />
                                    <span>Delivery</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="h-3 w-3" />
                                    <span>Pickup</span>
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
        )}
      </div>

      {/* Contact Information Dialog */}
      <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>
              {contactInfo?.type === "delivery"
                ? "Delivery Information"
                : "Pickup Information"}
            </DialogTitle>
            <DialogDescription>
              Contact details for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {contactInfo?.type === "delivery" && contactInfo?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-500 mb-1">
                    Delivery Address
                  </p>
                  <p className="text-gray-900 break-words">{contactInfo.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-500 mb-1">
                  Contact Number
                </p>
                <p className="text-gray-900">
                  <a 
                    href={`tel:${contactInfo?.phone}`}
                    className="hover:underline text-blue-600"
                  >
                    {contactInfo?.phone}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;