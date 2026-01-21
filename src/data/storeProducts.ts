export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  rating?: number;
  reviews?: number;
}

export interface StoreDetail {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  coverColor: string;
  category: 'food' | 'groceries' | 'electronics' | 'pharmacy';
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: string;
  openingHours: string;
  products: Product[];
}

export const storeDetails: Record<string, StoreDetail> = {
  kfc: {
    id: 'kfc',
    name: 'KFC',
    description: 'Finger Lickin\' Good - The world\'s favorite fried chicken',
    logo: 'https://upload.wikimedia.org/wikipedia/sco/thumb/b/bf/KFC_logo.svg/1200px-KFC_logo.svg.png',
    coverImage: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800',
    coverColor: 'bg-red-600',
    category: 'food',
    rating: 4.5,
    reviews: 2847,
    deliveryTime: '25-35 min',
    deliveryFee: 8,
    minOrder: 30,
    address: 'Oxford Street, Osu, Accra',
    openingHours: '10:00 AM - 10:00 PM',
    products: [
      { id: 'kfc-1', name: 'Zinger Burger', description: 'Crispy chicken fillet with spicy mayo and lettuce', price: 45, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', category: 'Burgers', popular: true, rating: 4.8, reviews: 523 },
      { id: 'kfc-2', name: 'Bucket of 8 Pieces', description: 'Original recipe fried chicken - 8 pieces', price: 120, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', category: 'Chicken', popular: true, rating: 4.9, reviews: 892 },
      { id: 'kfc-3', name: 'Streetwise 2', description: '2 pieces chicken, chips and drink', price: 55, image: 'https://images.unsplash.com/photo-1585325701165-351af407f3e3?w=400', category: 'Combos', popular: true, rating: 4.6, reviews: 445 },
      { id: 'kfc-4', name: 'Popcorn Chicken', description: 'Bite-sized crispy chicken pieces', price: 35, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', category: 'Snacks', rating: 4.5, reviews: 234 },
      { id: 'kfc-5', name: 'Coleslaw', description: 'Fresh creamy coleslaw', price: 15, image: 'https://images.unsplash.com/photo-1625938145744-533f4e27e351?w=400', category: 'Sides', rating: 4.3, reviews: 156 },
      { id: 'kfc-6', name: 'Twister Wrap', description: 'Chicken strips in a soft tortilla with sauce', price: 40, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', category: 'Wraps', rating: 4.4, reviews: 312 },
    ],
  },
  shoprite: {
    id: 'shoprite',
    name: 'Shoprite',
    description: 'Africa\'s largest supermarket chain - Quality products at low prices',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Shoprite_%28South_Africa%29_logo.svg/1200px-Shoprite_%28South_Africa%29_logo.svg.png',
    coverImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    coverColor: 'bg-red-500',
    category: 'groceries',
    rating: 4.3,
    reviews: 1523,
    deliveryTime: '30-45 min',
    deliveryFee: 12,
    minOrder: 50,
    address: 'Accra Mall, Spintex Road',
    openingHours: '8:00 AM - 9:00 PM',
    products: [
      { id: 'shop-1', name: 'Fresh Fruits Bundle', description: 'Assorted fresh fruits - Apples, Oranges, Bananas', price: 45, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', category: 'Fruits', popular: true, rating: 4.7, reviews: 234 },
      { id: 'shop-2', name: 'Vegetable Pack', description: 'Fresh vegetables - Tomatoes, Onions, Peppers', price: 35, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', category: 'Vegetables', popular: true, rating: 4.6, reviews: 189 },
      { id: 'shop-3', name: 'Rice 5kg', description: 'Premium long grain rice', price: 85, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', category: 'Grains', rating: 4.5, reviews: 156 },
      { id: 'shop-4', name: 'Cooking Oil 2L', description: 'Pure vegetable cooking oil', price: 55, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', category: 'Cooking', rating: 4.4, reviews: 98 },
      { id: 'shop-5', name: 'Milk 1L Pack of 3', description: 'Fresh full cream milk', price: 40, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', category: 'Dairy', rating: 4.6, reviews: 145 },
      { id: 'shop-6', name: 'Bread Loaf', description: 'Fresh baked white bread', price: 12, image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', category: 'Bakery', rating: 4.3, reviews: 201 },
    ],
  },
  melcom: {
    id: 'melcom',
    name: 'Melcom',
    description: 'Ghana\'s leading retail chain - Everything you need under one roof',
    logo: 'https://melcomgroup.com/wp-content/uploads/2023/03/melcom-logo.png',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    coverColor: 'bg-blue-600',
    category: 'groceries',
    rating: 4.4,
    reviews: 1876,
    deliveryTime: '35-50 min',
    deliveryFee: 15,
    minOrder: 100,
    address: 'North Industrial Area, Accra',
    openingHours: '8:00 AM - 8:00 PM',
    products: [
      { id: 'mel-1', name: 'Samsung TV 43"', description: 'Smart LED TV with Full HD display', price: 2500, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', category: 'Electronics', popular: true, rating: 4.8, reviews: 89 },
      { id: 'mel-2', name: 'Blender Set', description: 'Multi-purpose blender with accessories', price: 180, image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400', category: 'Appliances', popular: true, rating: 4.5, reviews: 156 },
      { id: 'mel-3', name: 'Bedsheet Set', description: 'Premium cotton bedsheet with pillowcases', price: 120, image: 'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=400', category: 'Home', rating: 4.4, reviews: 78 },
      { id: 'mel-4', name: 'Cooking Pots Set', description: 'Non-stick cooking pots - 5 piece set', price: 250, image: 'https://images.unsplash.com/photo-1584990347449-a6eb04e29e33?w=400', category: 'Kitchen', rating: 4.6, reviews: 112 },
      { id: 'mel-5', name: 'Standing Fan', description: '16 inch oscillating standing fan', price: 150, image: 'https://images.unsplash.com/photo-1617375407633-acd67aba7864?w=400', category: 'Appliances', rating: 4.3, reviews: 67 },
      { id: 'mel-6', name: 'Office Chair', description: 'Ergonomic office chair with lumbar support', price: 450, image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400', category: 'Furniture', rating: 4.7, reviews: 45 },
    ],
  },
  'pizza-man': {
    id: 'pizza-man',
    name: 'Pizza Man',
    description: 'Authentic Italian pizzas made fresh with the finest ingredients',
    logo: 'https://images.deliveryhero.io/image/fd-gh/LH/z7wf-hero.jpg',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    coverColor: 'bg-yellow-500',
    category: 'food',
    rating: 4.6,
    reviews: 1234,
    deliveryTime: '30-40 min',
    deliveryFee: 10,
    minOrder: 40,
    address: 'Labone, Accra',
    openingHours: '11:00 AM - 11:00 PM',
    products: [
      { id: 'pm-1', name: 'Pepperoni Pizza Large', description: 'Classic pepperoni with mozzarella cheese', price: 85, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', category: 'Pizza', popular: true, rating: 4.9, reviews: 456 },
      { id: 'pm-2', name: 'Chicken BBQ Pizza', description: 'Grilled chicken with BBQ sauce and onions', price: 90, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Pizza', popular: true, rating: 4.7, reviews: 312 },
      { id: 'pm-3', name: 'Margherita Pizza', description: 'Fresh tomatoes, mozzarella and basil', price: 65, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', category: 'Pizza', rating: 4.6, reviews: 234 },
      { id: 'pm-4', name: 'Garlic Bread', description: 'Crispy bread with garlic butter', price: 25, image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400', category: 'Sides', rating: 4.5, reviews: 189 },
      { id: 'pm-5', name: 'Chicken Wings', description: '8 pieces buffalo wings with dipping sauce', price: 55, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', category: 'Sides', rating: 4.4, reviews: 145 },
      { id: 'pm-6', name: 'Coca-Cola 1.5L', description: 'Ice cold Coca-Cola', price: 15, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', category: 'Drinks', rating: 4.8, reviews: 567 },
    ],
  },
  'chicken-inn': {
    id: 'chicken-inn',
    name: 'Chicken Inn',
    description: 'Delicious fried chicken and tasty sides for the whole family',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvSjnG4N7zHGPhYXmY4b7TxR7UL4ZH1xSqsg&s',
    coverImage: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
    coverColor: 'bg-orange-500',
    category: 'food',
    rating: 4.4,
    reviews: 987,
    deliveryTime: '20-30 min',
    deliveryFee: 8,
    minOrder: 25,
    address: 'Circle, Accra',
    openingHours: '9:00 AM - 10:00 PM',
    products: [
      { id: 'ci-1', name: '2 Piece Chicken & Chips', description: 'Golden fried chicken with crispy chips', price: 45, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', category: 'Combos', popular: true, rating: 4.7, reviews: 345 },
      { id: 'ci-2', name: 'Chicken Burger', description: 'Crispy chicken patty with fresh vegetables', price: 35, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', category: 'Burgers', popular: true, rating: 4.5, reviews: 267 },
      { id: 'ci-3', name: 'Family Bucket', description: '10 pieces of chicken for the family', price: 150, image: 'https://images.unsplash.com/photo-1585325701165-351af407f3e3?w=400', category: 'Chicken', rating: 4.8, reviews: 189 },
      { id: 'ci-4', name: 'Chips Regular', description: 'Golden crispy chips', price: 15, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Sides', rating: 4.3, reviews: 456 },
      { id: 'ci-5', name: 'Coleslaw', description: 'Creamy fresh coleslaw', price: 10, image: 'https://images.unsplash.com/photo-1625938145744-533f4e27e351?w=400', category: 'Sides', rating: 4.2, reviews: 123 },
      { id: 'ci-6', name: 'Ice Cream Sundae', description: 'Vanilla ice cream with chocolate sauce', price: 20, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', category: 'Desserts', rating: 4.6, reviews: 234 },
    ],
  },
  'pharmacy-1': {
    id: 'pharmacy-1',
    name: 'Ernest Chemists',
    description: 'Your trusted pharmacy for medicines and health products',
    logo: 'https://ernestchemist.com/cdn/shop/files/logo_dark.png',
    coverImage: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',
    coverColor: 'bg-teal-600',
    category: 'pharmacy',
    rating: 4.7,
    reviews: 567,
    deliveryTime: '20-30 min',
    deliveryFee: 6,
    minOrder: 20,
    address: 'Ring Road Central, Accra',
    openingHours: '7:00 AM - 10:00 PM',
    products: [
      { id: 'ec-1', name: 'Paracetamol Pack', description: 'Pain relief tablets - 24 pack', price: 15, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Pain Relief', popular: true, rating: 4.8, reviews: 234 },
      { id: 'ec-2', name: 'Vitamin C 1000mg', description: 'Immune support - 30 tablets', price: 45, image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400', category: 'Vitamins', popular: true, rating: 4.7, reviews: 189 },
      { id: 'ec-3', name: 'First Aid Kit', description: 'Complete first aid essentials', price: 85, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', category: 'First Aid', rating: 4.6, reviews: 78 },
      { id: 'ec-4', name: 'Hand Sanitizer 500ml', description: 'Antibacterial hand sanitizer', price: 25, image: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400', category: 'Hygiene', rating: 4.5, reviews: 345 },
      { id: 'ec-5', name: 'Face Masks 50 Pack', description: 'Disposable protective face masks', price: 35, image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400', category: 'Protection', rating: 4.4, reviews: 156 },
      { id: 'ec-6', name: 'Blood Pressure Monitor', description: 'Digital blood pressure monitor', price: 180, image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400', category: 'Devices', rating: 4.9, reviews: 67 },
    ],
  },
  papaye: {
    id: 'papaye',
    name: 'Papaye',
    description: 'Ghana\'s favorite fast food - Fresh, tasty and affordable',
    logo: 'https://papayeghana.com/wp-content/uploads/2020/06/papaye-logo.png',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    coverColor: 'bg-amber-500',
    category: 'food',
    rating: 4.5,
    reviews: 2134,
    deliveryTime: '25-35 min',
    deliveryFee: 8,
    minOrder: 30,
    address: 'Osu, Oxford Street, Accra',
    openingHours: '8:00 AM - 11:00 PM',
    products: [
      { id: 'pap-1', name: 'Jollof Rice & Chicken', description: 'Ghana\'s famous jollof rice with grilled chicken', price: 50, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400', category: 'Rice', popular: true, rating: 4.9, reviews: 678 },
      { id: 'pap-2', name: 'Fried Rice Special', description: 'Fried rice with vegetables and choice of protein', price: 55, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', category: 'Rice', popular: true, rating: 4.7, reviews: 456 },
      { id: 'pap-3', name: 'Grilled Tilapia', description: 'Fresh grilled tilapia with banku', price: 75, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', category: 'Seafood', rating: 4.8, reviews: 234 },
      { id: 'pap-4', name: 'Waakye Special', description: 'Rice and beans with all the trimmings', price: 45, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', category: 'Local', rating: 4.6, reviews: 345 },
      { id: 'pap-5', name: 'Meat Pie', description: 'Freshly baked meat pie', price: 12, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', category: 'Snacks', rating: 4.4, reviews: 567 },
      { id: 'pap-6', name: 'Fresh Fruit Juice', description: 'Freshly squeezed tropical fruit juice', price: 18, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', category: 'Drinks', rating: 4.7, reviews: 289 },
    ],
  },
  hisense: {
    id: 'hisense',
    name: 'Hisense',
    description: 'Premium electronics and home appliances - Quality meets innovation',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Hisense_logo.svg/2560px-Hisense_logo.svg.png',
    coverImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
    coverColor: 'bg-emerald-600',
    category: 'electronics',
    rating: 4.6,
    reviews: 1456,
    deliveryTime: '1-2 days',
    deliveryFee: 25,
    minOrder: 200,
    address: 'Accra Mall, Spintex Road',
    openingHours: '9:00 AM - 8:00 PM',
    products: [
      { id: 'his-1', name: 'Hisense 55" 4K Smart TV', description: 'Ultra HD Smart TV with Dolby Vision and built-in streaming apps', price: 4500, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', category: 'TVs', popular: true, rating: 4.9, reviews: 234 },
      { id: 'his-2', name: 'Hisense 43" Full HD TV', description: 'Crystal clear Full HD display with HDMI connectivity', price: 2200, image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400', category: 'TVs', popular: true, rating: 4.7, reviews: 189 },
      { id: 'his-3', name: 'Hisense 65" QLED TV', description: 'Quantum Dot technology for vibrant colors', price: 7500, image: 'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=400', category: 'TVs', rating: 4.8, reviews: 145 },
      { id: 'his-4', name: 'Hisense Side-by-Side Fridge', description: '500L capacity with water dispenser and ice maker', price: 5800, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400', category: 'Refrigerators', popular: true, rating: 4.8, reviews: 167 },
      { id: 'his-5', name: 'Hisense French Door Fridge', description: 'Premium 600L refrigerator with smart features', price: 8500, image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400', category: 'Refrigerators', rating: 4.9, reviews: 89 },
      { id: 'his-6', name: 'Hisense Chest Freezer 300L', description: 'Deep freeze chest freezer for bulk storage', price: 1800, image: 'https://images.unsplash.com/photo-1620735692151-26a7e0748f2d?w=400', category: 'Freezers', rating: 4.6, reviews: 123 },
      { id: 'his-7', name: 'Hisense 1.5HP Split AC', description: 'Inverter technology for energy efficient cooling', price: 3200, image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400', category: 'Air Conditioners', popular: true, rating: 4.7, reviews: 256 },
      { id: 'his-8', name: 'Hisense 2HP Split AC', description: 'Powerful cooling for larger rooms with fast cool', price: 4200, image: 'https://images.unsplash.com/photo-1631567091085-e990eeca2135?w=400', category: 'Air Conditioners', rating: 4.6, reviews: 178 },
      { id: 'his-9', name: 'Hisense Front Load Washer 8KG', description: 'Smart wash programs with steam cleaning', price: 3500, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400', category: 'Washing Machines', rating: 4.8, reviews: 145 },
      { id: 'his-10', name: 'Hisense Top Load Washer 10KG', description: 'Large capacity with multiple wash modes', price: 2800, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400', category: 'Washing Machines', rating: 4.5, reviews: 98 },
      { id: 'his-11', name: 'Hisense Microwave 30L', description: 'Convection microwave with grill function', price: 650, image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400', category: 'Kitchen Appliances', rating: 4.4, reviews: 234 },
      { id: 'his-12', name: 'Hisense Soundbar 2.1', description: 'Wireless subwoofer with Bluetooth connectivity', price: 850, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', category: 'Audio', rating: 4.7, reviews: 167 },
    ],
  },
};