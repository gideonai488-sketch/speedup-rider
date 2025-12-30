export interface LaundryService {
  id: string;
  name: string;
  description: string;
  image: string;
  priceRange: string;
  pricePerKg?: number;
  deliveryTime: string;
  tags: ('Popular' | 'Express' | 'New' | 'Eco')[];
  category: string;
}

export interface CartItem {
  service: LaundryService;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  pickupAddress: string;
  pickupTime: string;
  deliveryTime: string;
  total: number;
  createdAt: string;
}

export type OrderStatus = 
  | 'received'
  | 'rider_pickup'
  | 'picked_up'
  | 'washing'
  | 'drying'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered';

export interface OrderStatusInfo {
  status: OrderStatus;
  label: string;
  description: string;
  icon: string;
}
