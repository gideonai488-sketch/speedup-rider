export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { serviceName: string; quantity: number; price: number }[];
  status: AdminOrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  assignedRider?: string;
  total: number;
  createdAt: string;
  estimatedDelivery: string;
}

export type AdminOrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'picked_up'
  | 'processing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
  currentOrders: number;
  totalDeliveries: number;
  rating: number;
  joinedAt: string;
}

export interface ServicePricing {
  id: string;
  serviceName: string;
  pricePerKg: number;
  minWeight: number;
  expressMultiplier: number;
  isActive: boolean;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  activeRiders: number;
  avgDeliveryTime: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topServices: { name: string; orders: number; revenue: number }[];
}
