import { ServiceType } from './delivery';

export type PackageSize = 'small' | 'medium' | 'large' | 'extra-large';

export type ErrandTaskType = 'pay_bills' | 'queue' | 'buy_something' | 'return_item' | 'other';

export type DeliveryTiming = 'asap' | 'scheduled';

export interface PackageDetails {
  size: PackageSize;
  isFragile: boolean;
  declaredValue: number;
  photoUrl?: string;
}

export interface FoodDetails {
  keepWarm: boolean;
  keepCold: boolean;
  utensilsNeeded: boolean;
  contactlessDelivery: boolean;
}

export interface ErrandDetails {
  taskType: ErrandTaskType;
  budgetAmount: number;
  timing: DeliveryTiming;
  scheduledTime?: Date;
  requireReceipt: boolean;
  taskDescription: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  landmark?: string;
  isDefault?: boolean;
}

export interface DeliveryStop {
  id: string;
  address: string;
  coords: { lat: number; lng: number } | null;
  landmark?: string;
  contactName?: string;
  contactPhone?: string;
  order: number;
}

export interface BookingFormData {
  serviceType: ServiceType | '';
  timing: DeliveryTiming;
  scheduledDate?: Date;
  scheduledTime?: string;
  
  // Pickup
  pickupAddress: string;
  pickupCoords: { lat: number; lng: number } | null;
  pickupLandmark: string;
  
  // Multi-stop dropoffs
  dropoffs: DeliveryStop[];
  
  // Service-specific details
  packageDetails?: PackageDetails;
  foodDetails?: FoodDetails;
  errandDetails?: ErrandDetails;
  
  // General
  description: string;
  contactName: string;
  contactPhone: string;
}

export interface FeeEstimate {
  distance: number;
  duration: string;
  fee: number;
  baseFee: number;
  distanceFee: number;
  serviceFee: number;
  surgeMultiplier: number;
  insuranceFee?: number;
  expressBonus?: number;
}

export const PACKAGE_SIZES: { value: PackageSize; label: string; description: string; maxWeight: string }[] = [
  { value: 'small', label: 'Small', description: 'Fits in a bag', maxWeight: 'Up to 2kg' },
  { value: 'medium', label: 'Medium', description: 'Fits in a box', maxWeight: 'Up to 5kg' },
  { value: 'large', label: 'Large', description: 'Needs both hands', maxWeight: 'Up to 15kg' },
  { value: 'extra-large', label: 'Extra Large', description: 'May need help', maxWeight: 'Up to 30kg' },
];

export const ERRAND_TASK_TYPES: { value: ErrandTaskType; label: string; icon: string }[] = [
  { value: 'pay_bills', label: 'Pay Bills', icon: '💵' },
  { value: 'queue', label: 'Queue for Me', icon: '⏳' },
  { value: 'buy_something', label: 'Buy Something', icon: '🛍️' },
  { value: 'return_item', label: 'Return Item', icon: '↩️' },
  { value: 'other', label: 'Other Task', icon: '📝' },
];
