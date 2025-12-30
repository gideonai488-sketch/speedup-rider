import { LaundryService } from '@/types/laundry';

import washFoldImg from '@/assets/services/wash-fold.jpg';
import expressImg from '@/assets/services/express.jpg';
import dryCleanImg from '@/assets/services/dry-clean.jpg';
import ironImg from '@/assets/services/iron.jpg';
import bulkImg from '@/assets/services/bulk.jpg';
import beddingImg from '@/assets/services/bedding.jpg';
import sneakersImg from '@/assets/services/sneakers.jpg';
import ecoImg from '@/assets/services/eco.jpg';

export const laundryServices: LaundryService[] = [
  {
    id: '1',
    name: 'Wash & Fold',
    description: 'Professional washing and folding service for your everyday clothes. We use premium detergents and fabric softeners.',
    image: washFoldImg,
    priceRange: 'GH₵ 25-50',
    pricePerKg: 15,
    deliveryTime: '24-48 hours',
    tags: ['Popular'],
    category: 'wash',
  },
  {
    id: '2',
    name: 'Express Wash',
    description: 'Need it fast? Get your laundry done in just 6 hours with our express service.',
    image: expressImg,
    priceRange: 'GH₵ 40-80',
    pricePerKg: 25,
    deliveryTime: '6 hours',
    tags: ['Express', 'Popular'],
    category: 'wash',
  },
  {
    id: '3',
    name: 'Dry Cleaning',
    description: 'Expert dry cleaning for delicate fabrics, suits, dresses, and formal wear.',
    image: dryCleanImg,
    priceRange: 'GH₵ 35-100',
    deliveryTime: '48-72 hours',
    tags: ['Popular'],
    category: 'dry-clean',
  },
  {
    id: '4',
    name: 'Ironing Only',
    description: 'Crisp, professional ironing for your already-clean clothes.',
    image: ironImg,
    priceRange: 'GH₵ 15-30',
    deliveryTime: '24 hours',
    tags: [],
    category: 'iron',
  },
  {
    id: '5',
    name: 'Bulk Laundry',
    description: 'Perfect for families and large loads. Save up to 20% on bulk orders.',
    image: bulkImg,
    priceRange: 'GH₵ 80-200',
    pricePerKg: 12,
    deliveryTime: '48-72 hours',
    tags: ['New'],
    category: 'wash',
  },
  {
    id: '6',
    name: 'Bedding & Linens',
    description: 'Fresh, clean bedsheets, pillowcases, duvets, and towels.',
    image: beddingImg,
    priceRange: 'GH₵ 30-75',
    deliveryTime: '48 hours',
    tags: [],
    category: 'specialty',
  },
  {
    id: '7',
    name: 'Sneaker Cleaning',
    description: 'Restore your sneakers to their former glory with our specialized cleaning.',
    image: sneakersImg,
    priceRange: 'GH₵ 40-80',
    deliveryTime: '72 hours',
    tags: ['New', 'Popular'],
    category: 'specialty',
  },
  {
    id: '8',
    name: 'Eco Wash',
    description: 'Environmentally friendly washing with biodegradable detergents.',
    image: ecoImg,
    priceRange: 'GH₵ 30-55',
    pricePerKg: 18,
    deliveryTime: '24-48 hours',
    tags: ['Eco', 'New'],
    category: 'wash',
  },
];

export const categories = [
  { id: 'all', name: 'All Services' },
  { id: 'wash', name: 'Wash & Fold' },
  { id: 'dry-clean', name: 'Dry Cleaning' },
  { id: 'iron', name: 'Ironing' },
  { id: 'specialty', name: 'Specialty' },
];
