export type UserRole = 'customer' | 'rider';

export type ServiceType = 'food' | 'groceries' | 'pharmacy' | 'errands' | 'packages' | 'documents' | 'shipping';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
}

export interface DeliveryRequest {
  id: string;
  customerId: string;
  riderId?: string;
  serviceType: ServiceType;
  pickupLocation: Location;
  dropoffLocation: Location;
  description: string;
  estimatedFee: number;
  actualFee?: number;
  status: DeliveryStatus;
  createdAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}

export type DeliveryStatus = 
  | 'pending'
  | 'searching'
  | 'accepted'
  | 'arriving_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car';
  vehiclePlate: string;
  rating: number;
  totalDeliveries: number;
  isOnline: boolean;
  currentLocation?: Location;
}

export interface ServiceCategory {
  id: ServiceType;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  pricePerKm: number;
  color: string;
}
