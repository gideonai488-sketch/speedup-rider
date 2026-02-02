import kfcLogo from '@/assets/stores/kfc-logo.png';
import shopriteLogo from '@/assets/stores/shoprite-logo.png';
import melcomLogo from '@/assets/stores/melcom-logo.png';
import pizzaManLogo from '@/assets/stores/pizza-man-logo.png';
import chickenInnLogo from '@/assets/stores/chicken-inn-logo.png';
import ernestChemistsLogo from '@/assets/stores/ernest-chemists-logo.png';
import papayeLogo from '@/assets/stores/papaye-logo.png';
import hisenseLogo from '@/assets/stores/hisense-logo.png';

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
    logo: kfcLogo,
    coverImage: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
    coverColor: 'bg-red-600',
    category: 'food',
    rating: 4.5,
    reviews: 2847,
    deliveryTime: '25-35 min',
    deliveryFee: 15,
    minOrder: 50,
    address: 'Oxford Street, Osu, Accra',
    openingHours: '10:00 AM - 10:00 PM',
    products: [
      // Promotions - Real KFC Ghana prices 2025
      { id: 'kfc-1', name: 'KFC Loaded Fries', description: 'Crispy fries topped with cheese sauce, chicken bites and special sauce', price: 78, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Promotions', popular: true, rating: 4.8, reviews: 523 },
      { id: 'kfc-2', name: 'Honey Dunked Wings', description: 'Sweet and crispy honey glazed wings - 6 pieces', price: 87, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', category: 'Promotions', popular: true, rating: 4.9, reviews: 412 },
      { id: 'kfc-3', name: 'Honey Dunked Twister Meal', description: 'Honey dunked tender in tortilla with chips and drink', price: 102, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', category: 'Promotions', popular: true, rating: 4.7, reviews: 289 },
      { id: 'kfc-4', name: 'Honey Dunked Twister', description: '1 Piece Tortilla, Lettuce, Tomatoes, and a Honey Dunked Tender', price: 61, image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', category: 'Promotions', rating: 4.6, reviews: 234 },
      // Meals
      { id: 'kfc-5', name: 'Burger Meal - Zinger', description: 'Zinger burger with chips and drink', price: 95, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', category: 'Meals', popular: true, rating: 4.8, reviews: 634 },
      { id: 'kfc-6', name: 'Burger Meal - Colonel', description: 'Colonel burger with chips and drink', price: 95, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'Meals', rating: 4.7, reviews: 456 },
      { id: 'kfc-7', name: 'Twister Meal - Zinger', description: 'Zinger twister wrap with chips and drink', price: 78, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', category: 'Meals', popular: true, rating: 4.6, reviews: 378 },
      { id: 'kfc-8', name: 'Twister Meal - Colonel', description: 'Colonel twister wrap with chips and drink', price: 78, image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', category: 'Meals', rating: 4.5, reviews: 312 },
      { id: 'kfc-9', name: 'Boxmaster Meal - Zinger', description: 'Ultimate zinger boxmaster with chips and drink', price: 119, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', category: 'Meals', rating: 4.8, reviews: 289 },
      // Streetwise
      { id: 'kfc-10', name: 'Streetwise Wings Meal - Chips', description: '3 wings with chips and drink', price: 47, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', category: 'Streetwise', popular: true, rating: 4.6, reviews: 567 },
      { id: 'kfc-11', name: 'Streetwise Wings Meal - Rice', description: '3 wings with jollof rice and drink', price: 47, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400', category: 'Streetwise', rating: 4.5, reviews: 445 },
      { id: 'kfc-12', name: 'Streetwise 5 - Hot & Crispy', description: '5 Pieces of Hot & Crispy Chicken and Large Chips', price: 150, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', category: 'Streetwise', popular: true, rating: 4.8, reviews: 423 },
      { id: 'kfc-13', name: 'KFC WOW Deal - Hot & Crispy', description: '2 pieces chicken with chips and drink', price: 47, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', category: 'Streetwise', rating: 4.5, reviews: 389 },
      { id: 'kfc-14', name: 'KFC WOW Deal - Original Recipe', description: '2 pieces OR chicken with chips and drink', price: 47, image: 'https://images.unsplash.com/photo-1585325701165-351af407f3e3?w=400', category: 'Streetwise', rating: 4.6, reviews: 356 },
      // Buckets
      { id: 'kfc-15', name: 'Easter Bucket - Hot & Crispy', description: '8 piece chicken, 2 large chips & 3 300ML Drinks', price: 299, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', category: 'Buckets', popular: true, rating: 4.9, reviews: 234 },
      { id: 'kfc-16', name: 'Easter Bucket - Original Recipe', description: '8 piece OR chicken, 2 large chips & 3 300ML Drinks', price: 299, image: 'https://images.unsplash.com/photo-1585325701165-351af407f3e3?w=400', category: 'Buckets', rating: 4.8, reviews: 198 },
      // Sides & Drinks
      { id: 'kfc-17', name: 'Large Chips', description: 'Golden crispy french fries - large portion', price: 42, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Sides', rating: 4.4, reviews: 456 },
      { id: 'kfc-18', name: 'KFC Jollof Rice', description: 'Signature KFC jollof rice side', price: 35, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400', category: 'Sides', rating: 4.3, reviews: 389 },
      { id: 'kfc-19', name: 'Coca Cola 300ml', description: 'Ice cold Coca-Cola', price: 14, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', category: 'Drinks', rating: 4.8, reviews: 567 },
    ],
  },
  papaye: {
    id: 'papaye',
    name: 'Papaye',
    description: 'Ghana\'s favorite fast food - Fresh, tasty and affordable',
    logo: papayeLogo,
    coverImage: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800',
    coverColor: 'bg-amber-500',
    category: 'food',
    rating: 4.5,
    reviews: 2134,
    deliveryTime: '25-35 min',
    deliveryFee: 12,
    minOrder: 40,
    address: 'Osu, Oxford Street, Accra',
    openingHours: '8:00 AM - 11:00 PM',
    products: [
      // Chicken - Real Papaye Ghana prices 2025
      { id: 'pap-1', name: 'Broasted Chicken Rice with Coleslaw', description: 'Crispy broasted chicken with fried rice and coleslaw', price: 75, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400', category: 'Chicken', popular: true, rating: 4.9, reviews: 678 },
      { id: 'pap-2', name: 'Broasted Chicken Chips with Coleslaw', description: 'Crispy broasted chicken with chips and coleslaw', price: 75, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', category: 'Chicken', popular: true, rating: 4.8, reviews: 534 },
      { id: 'pap-3', name: 'Grilled Chicken Rice with Coleslaw', description: 'Charcoal grilled chicken with fried rice and coleslaw', price: 75, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400', category: 'Chicken', popular: true, rating: 4.8, reviews: 489 },
      { id: 'pap-4', name: 'Grilled Chicken Chips with Coleslaw', description: 'Charcoal grilled chicken with chips and coleslaw', price: 75, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Chicken', rating: 4.7, reviews: 423 },
      { id: 'pap-5', name: 'Full Chicken', description: 'Full roasted chicken with pepper and vegetables', price: 135, image: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400', category: 'Chicken', popular: true, rating: 4.9, reviews: 312 },
      // Mini Meals
      { id: 'pap-6', name: 'Mini Rice with Coleslaw', description: '1pc fried chicken with fried rice and coleslaw', price: 37, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', category: 'Mini Meals', popular: true, rating: 4.6, reviews: 567 },
      { id: 'pap-7', name: 'Mini Chips with Coleslaw', description: '1pc fried chicken with chips and coleslaw', price: 37, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', category: 'Mini Meals', rating: 4.5, reviews: 456 },
      // Fish
      { id: 'pap-8', name: 'Grilled Fish Rice with Coleslaw', description: 'Fresh grilled tilapia with fried rice and coleslaw', price: 88, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', category: 'Fish', popular: true, rating: 4.8, reviews: 234 },
      { id: 'pap-9', name: 'Grilled Fish Chips with Coleslaw', description: 'Fresh grilled tilapia with chips and coleslaw', price: 88, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', category: 'Fish', rating: 4.7, reviews: 198 },
      { id: 'pap-10', name: 'Fried Fish Rice with Coleslaw', description: 'Crispy fried fish with fried rice and coleslaw', price: 88, image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400', category: 'Fish', rating: 4.6, reviews: 167 },
      // Burgers
      { id: 'pap-11', name: 'Beef Burger', description: 'Classic beef burger with lettuce, onion and tomatoes', price: 55, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'Burgers', rating: 4.5, reviews: 289 },
      { id: 'pap-12', name: 'Cheese Burger', description: 'Beef burger with melted cheese, lettuce and tomatoes', price: 60, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', category: 'Burgers', popular: true, rating: 4.7, reviews: 345 },
      { id: 'pap-13', name: 'Egg Burger', description: 'Burger with egg, burger meat, lettuce, onion and tomatoes', price: 60, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', category: 'Burgers', rating: 4.4, reviews: 234 },
      { id: 'pap-14', name: 'Cheese Egg Burger', description: 'Burger with cheese, egg, burger meat, lettuce, onion and tomatoes', price: 63, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', category: 'Burgers', rating: 4.6, reviews: 189 },
      // Drinks
      { id: 'pap-15', name: 'Fresh Fruit Juice', description: 'Freshly squeezed tropical fruit juice', price: 17, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', category: 'Drinks', rating: 4.7, reviews: 289 },
    ],
  },
  'chicken-inn': {
    id: 'chicken-inn',
    name: 'Chicken Inn',
    description: 'Luv Dat Chicken - Delicious fried chicken for the whole family',
    logo: chickenInnLogo,
    coverImage: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
    coverColor: 'bg-orange-500',
    category: 'food',
    rating: 4.4,
    reviews: 987,
    deliveryTime: '20-30 min',
    deliveryFee: 12,
    minOrder: 30,
    address: 'Accra Mall, Spintex Road',
    openingHours: '9:00 AM - 10:00 PM',
    products: [
      // Combos - Real Chicken Inn prices
      { id: 'ci-1', name: '2 Piece Chicken & Chips Meal', description: '2 pieces fried chicken with regular chips and Coke', price: 45, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', category: 'Combos', popular: true, rating: 4.7, reviews: 345 },
      { id: 'ci-2', name: '1 Piece Chicken & Large Chips', description: '1 piece fried chicken with large chips and Coke', price: 35, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', category: 'Combos', rating: 4.5, reviews: 289 },
      { id: 'ci-3', name: '3 Piece Chicken Meal', description: '3 pieces chicken with chips and drink', price: 58, image: 'https://images.unsplash.com/photo-1585325701165-351af407f3e3?w=400', category: 'Combos', popular: true, rating: 4.6, reviews: 312 },
      // Burgers
      { id: 'ci-4', name: 'Chicken Burger Meal', description: 'Crispy chicken burger with chips and Coke', price: 48, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', category: 'Burgers', popular: true, rating: 4.6, reviews: 267 },
      { id: 'ci-5', name: 'Double Chicken Burger', description: 'Double chicken patty with cheese, chips and Coke', price: 65, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'Burgers', rating: 4.7, reviews: 198 },
      { id: 'ci-6', name: 'Spicy Chicken Burger', description: 'Spicy crispy chicken burger with lettuce and mayo', price: 52, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', category: 'Burgers', rating: 4.5, reviews: 178 },
      // Buckets
      { id: 'ci-7', name: '6 Piece Bucket', description: '6 pieces of golden fried chicken', price: 85, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', category: 'Buckets', popular: true, rating: 4.8, reviews: 234 },
      { id: 'ci-8', name: '9 Piece Bucket', description: '9 pieces of golden fried chicken', price: 115, image: 'https://images.unsplash.com/photo-1585325701165-351af407f3e3?w=400', category: 'Buckets', popular: true, rating: 4.8, reviews: 189 },
      { id: 'ci-9', name: '9 Piece Bucket Meal', description: '9 pieces chicken with 3 jollof, 2 coleslaw and 2L Coke', price: 165, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', category: 'Buckets', rating: 4.9, reviews: 156 },
      { id: 'ci-10', name: '12 Piece Bucket', description: '12 pieces of golden fried chicken for sharing', price: 145, image: 'https://images.unsplash.com/photo-1585325701165-351af407f3e3?w=400', category: 'Buckets', rating: 4.7, reviews: 145 },
      // Rotisserie
      { id: 'ci-11', name: '1/4 Rotisserie Chicken', description: 'Quarter rotisserie chicken with chips and Coke', price: 42, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400', category: 'Rotisserie', rating: 4.5, reviews: 234 },
      { id: 'ci-12', name: 'Half Rotisserie Chicken', description: 'Half rotisserie chicken with chips and coleslaw', price: 72, image: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400', category: 'Rotisserie', rating: 4.6, reviews: 198 },
      { id: 'ci-13', name: 'Full Rotisserie Chicken', description: 'Whole rotisserie chicken with chips and 2 coleslaw', price: 95, image: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400', category: 'Rotisserie', popular: true, rating: 4.7, reviews: 178 },
      // Sides
      { id: 'ci-14', name: 'Regular Chips', description: 'Golden crispy chips', price: 18, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Sides', rating: 4.3, reviews: 456 },
      { id: 'ci-15', name: 'Large Chips', description: 'Large portion of golden chips', price: 25, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Sides', rating: 4.4, reviews: 389 },
      { id: 'ci-16', name: 'Coleslaw', description: 'Creamy fresh coleslaw', price: 12, image: 'https://images.unsplash.com/photo-1625938145744-533f4e27e351?w=400', category: 'Sides', rating: 4.2, reviews: 123 },
    ],
  },
  'pizza-man': {
    id: 'pizza-man',
    name: 'Pizzaman Chickenman',
    description: 'Ghana\'s favorite pizza and chicken - Fresh ingredients, great taste',
    logo: pizzaManLogo,
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    coverColor: 'bg-yellow-500',
    category: 'food',
    rating: 4.6,
    reviews: 1234,
    deliveryTime: '30-40 min',
    deliveryFee: 15,
    minOrder: 50,
    address: 'Labone, Accra',
    openingHours: '11:00 AM - 11:00 PM',
    products: [
      // Pizza - Real Pizzaman prices
      { id: 'pm-1', name: 'Dukeman Pizza Large', description: 'Premium loaded pizza with pepperoni, sausage, beef and all toppings', price: 305, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', category: 'Pizza', popular: true, rating: 4.9, reviews: 456 },
      { id: 'pm-2', name: 'Dukeman Pizza Medium', description: 'Premium loaded pizza with all toppings - medium', price: 195, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Pizza', rating: 4.8, reviews: 389 },
      { id: 'pm-3', name: 'Breezy Pizza Large', description: 'Classic pizza with ham, mushrooms and fresh vegetables', price: 235, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', category: 'Pizza', rating: 4.7, reviews: 312 },
      { id: 'pm-4', name: 'Breezy Pizza Medium', description: 'Classic pizza with fresh vegetables - medium', price: 175, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Pizza', popular: true, rating: 4.7, reviews: 345 },
      { id: 'pm-5', name: 'Guyman Pizza', description: 'Budget-friendly personal pizza with cheese and toppings', price: 49, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', category: 'Pizza', popular: true, rating: 4.6, reviews: 534 },
      { id: 'pm-6', name: 'Kersame Pizza Medium', description: 'Spicy chicken, pepper and onion pizza', price: 165, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', category: 'Pizza', rating: 4.5, reviews: 234 },
      { id: 'pm-7', name: 'BBQ Chicken Pizza Large', description: 'BBQ sauce base with grilled chicken and onions', price: 265, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', category: 'Pizza', rating: 4.6, reviews: 198 },
      // Rice Meals
      { id: 'pm-8', name: 'Jollof Rice Bucket', description: 'Delicious jollof rice with fried chicken pieces', price: 135, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400', category: 'Rice', popular: true, rating: 4.8, reviews: 389 },
      { id: 'pm-9', name: 'Fried Rice Bucket', description: 'Savory fried rice with vegetables and chicken', price: 145, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', category: 'Rice', rating: 4.7, reviews: 267 },
      { id: 'pm-10', name: 'Guyman Jollof', description: 'Budget jollof rice meal with chicken', price: 49, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', category: 'Rice', popular: true, rating: 4.5, reviews: 423 },
      // Chicken
      { id: 'pm-11', name: 'Chicken Wings 8pcs', description: 'Crispy fried chicken wings with sauce', price: 120, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', category: 'Chicken', rating: 4.6, reviews: 345 },
      { id: 'pm-12', name: 'Chicken Wings 12pcs', description: 'Party size crispy wings', price: 165, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', category: 'Chicken', rating: 4.7, reviews: 234 },
      // Combos
      { id: 'pm-13', name: 'Playman Pack', description: 'Pizza slice with chicken and drink combo', price: 79, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Combos', rating: 4.4, reviews: 189 },
      { id: 'pm-14', name: 'Family Pack', description: 'Large pizza, 8 wings, rice and 4 drinks', price: 385, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', category: 'Combos', popular: true, rating: 4.8, reviews: 156 },
      // Drinks
      { id: 'pm-15', name: 'Soft Drink 500ml', description: 'Coca-Cola, Fanta or Sprite', price: 20, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', category: 'Drinks', rating: 4.8, reviews: 567 },
    ],
  },
  shoprite: {
    id: 'shoprite',
    name: 'Shoprite',
    description: 'Africa\'s largest supermarket chain - Quality products at low prices',
    logo: shopriteLogo,
    coverImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    coverColor: 'bg-red-500',
    category: 'groceries',
    rating: 4.3,
    reviews: 1523,
    deliveryTime: '30-45 min',
    deliveryFee: 20,
    minOrder: 80,
    address: 'Accra Mall, Spintex Road',
    openingHours: '8:00 AM - 9:00 PM',
    products: [
      { id: 'shop-1', name: 'Fresh Fruits Bundle', description: 'Assorted fresh fruits - Apples, Oranges, Bananas', price: 75, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', category: 'Fruits', popular: true, rating: 4.7, reviews: 234 },
      { id: 'shop-2', name: 'Vegetable Pack', description: 'Fresh vegetables - Tomatoes, Onions, Peppers', price: 55, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', category: 'Vegetables', popular: true, rating: 4.6, reviews: 189 },
      { id: 'shop-3', name: 'Rice 5kg Bag', description: 'Premium long grain rice', price: 120, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', category: 'Grains', rating: 4.5, reviews: 156 },
      { id: 'shop-4', name: 'Cooking Oil 3L', description: 'Pure vegetable cooking oil', price: 95, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', category: 'Cooking', rating: 4.4, reviews: 98 },
      { id: 'shop-5', name: 'Milk 1L Pack of 3', description: 'Fresh full cream milk', price: 65, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', category: 'Dairy', rating: 4.6, reviews: 145 },
      { id: 'shop-6', name: 'Bread Loaf', description: 'Fresh baked white bread', price: 18, image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', category: 'Bakery', rating: 4.3, reviews: 201 },
      { id: 'shop-7', name: 'Eggs Crate (30pcs)', description: 'Farm fresh eggs', price: 85, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', category: 'Dairy', popular: true, rating: 4.7, reviews: 312 },
      { id: 'shop-8', name: 'Frozen Chicken 1kg', description: 'Quality frozen chicken cuts', price: 110, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', category: 'Frozen', rating: 4.4, reviews: 178 },
      { id: 'shop-9', name: 'Milo Tin 400g', description: 'Nestle Milo chocolate malt beverage', price: 48, image: 'https://images.unsplash.com/photo-1587132117091-e9e46c2e5ec1?w=400', category: 'Beverages', popular: true, rating: 4.8, reviews: 234 },
      { id: 'shop-10', name: 'Indomie Noodles Pack of 10', description: 'Instant noodles variety pack', price: 55, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400', category: 'Pantry', rating: 4.5, reviews: 289 },
    ],
  },
  melcom: {
    id: 'melcom',
    name: 'Melcom',
    description: 'Ghana\'s leading retail chain - Everything you need under one roof',
    logo: melcomLogo,
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    coverColor: 'bg-blue-600',
    category: 'groceries',
    rating: 4.4,
    reviews: 1876,
    deliveryTime: '35-50 min',
    deliveryFee: 25,
    minOrder: 150,
    address: 'North Industrial Area, Accra',
    openingHours: '8:00 AM - 8:00 PM',
    products: [
      { id: 'mel-1', name: 'Samsung TV 43"', description: 'Smart LED TV with Full HD display', price: 3800, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', category: 'Electronics', popular: true, rating: 4.8, reviews: 89 },
      { id: 'mel-2', name: 'Blender Set', description: 'Multi-purpose blender with accessories', price: 280, image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400', category: 'Appliances', popular: true, rating: 4.5, reviews: 156 },
      { id: 'mel-3', name: 'Bedsheet Set', description: 'Premium cotton bedsheet with pillowcases', price: 180, image: 'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=400', category: 'Home', rating: 4.4, reviews: 78 },
      { id: 'mel-4', name: 'Cooking Pots Set', description: 'Non-stick cooking pots - 5 piece set', price: 350, image: 'https://images.unsplash.com/photo-1584990347449-a6eb04e29e33?w=400', category: 'Kitchen', rating: 4.6, reviews: 112 },
      { id: 'mel-5', name: 'Standing Fan', description: '16 inch oscillating standing fan', price: 220, image: 'https://images.unsplash.com/photo-1617375407633-acd67aba7864?w=400', category: 'Appliances', rating: 4.3, reviews: 67 },
      { id: 'mel-6', name: 'Office Chair', description: 'Ergonomic office chair with lumbar support', price: 650, image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400', category: 'Furniture', rating: 4.7, reviews: 45 },
      { id: 'mel-7', name: 'Iron Box', description: 'Steam iron with anti-drip feature', price: 145, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', category: 'Appliances', rating: 4.4, reviews: 123 },
      { id: 'mel-8', name: 'Rice Cooker 2.8L', description: 'Electric rice cooker with keep warm function', price: 195, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', category: 'Kitchen', popular: true, rating: 4.6, reviews: 167 },
    ],
  },
  'pharmacy-1': {
    id: 'pharmacy-1',
    name: 'Ernest Chemists',
    description: 'Your trusted pharmacy for medicines and health products',
    logo: ernestChemistsLogo,
    coverImage: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',
    coverColor: 'bg-teal-600',
    category: 'pharmacy',
    rating: 4.7,
    reviews: 567,
    deliveryTime: '20-30 min',
    deliveryFee: 10,
    minOrder: 30,
    address: 'Ring Road Central, Accra',
    openingHours: '7:00 AM - 10:00 PM',
    products: [
      { id: 'ec-1', name: 'Paracetamol Pack', description: 'Pain relief tablets - 24 pack', price: 25, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Pain Relief', popular: true, rating: 4.8, reviews: 234 },
      { id: 'ec-2', name: 'Vitamin C 1000mg', description: 'Immune support - 30 tablets', price: 65, image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400', category: 'Vitamins', popular: true, rating: 4.7, reviews: 189 },
      { id: 'ec-3', name: 'First Aid Kit', description: 'Complete first aid essentials', price: 120, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', category: 'First Aid', rating: 4.6, reviews: 78 },
      { id: 'ec-4', name: 'Hand Sanitizer 500ml', description: 'Antibacterial hand sanitizer', price: 35, image: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400', category: 'Hygiene', rating: 4.5, reviews: 345 },
      { id: 'ec-5', name: 'Face Masks 50 Pack', description: 'Disposable protective face masks', price: 45, image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400', category: 'Protection', rating: 4.4, reviews: 156 },
      { id: 'ec-6', name: 'Blood Pressure Monitor', description: 'Digital blood pressure monitor', price: 280, image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400', category: 'Devices', rating: 4.9, reviews: 67 },
      { id: 'ec-7', name: 'Multivitamin 60 Tablets', description: 'Complete daily multivitamin', price: 85, image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400', category: 'Vitamins', popular: true, rating: 4.6, reviews: 198 },
      { id: 'ec-8', name: 'Cough Syrup 200ml', description: 'Relief from cough and cold', price: 38, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', category: 'Cold & Flu', rating: 4.4, reviews: 145 },
    ],
  },
  hisense: {
    id: 'hisense',
    name: 'Hisense',
    description: 'Premium electronics and home appliances - Quality meets innovation',
    logo: hisenseLogo,
    coverImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
    coverColor: 'bg-emerald-600',
    category: 'electronics',
    rating: 4.6,
    reviews: 1456,
    deliveryTime: '1-2 days',
    deliveryFee: 50,
    minOrder: 500,
    address: 'Accra Mall, Spintex Road',
    openingHours: '9:00 AM - 8:00 PM',
    products: [
      { id: 'his-1', name: 'Hisense 55" 4K Smart TV', description: 'Ultra HD Smart TV with Dolby Vision and built-in streaming apps', price: 5500, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', category: 'TVs', popular: true, rating: 4.9, reviews: 234 },
      { id: 'his-2', name: 'Hisense 43" Full HD TV', description: 'Crystal clear Full HD display with HDMI connectivity', price: 2800, image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400', category: 'TVs', popular: true, rating: 4.7, reviews: 189 },
      { id: 'his-3', name: 'Hisense 65" QLED TV', description: 'Quantum Dot technology for vibrant colors', price: 9500, image: 'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=400', category: 'TVs', rating: 4.8, reviews: 145 },
      { id: 'his-4', name: 'Hisense Side-by-Side Fridge', description: '500L capacity with water dispenser and ice maker', price: 7200, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400', category: 'Refrigerators', popular: true, rating: 4.8, reviews: 167 },
      { id: 'his-5', name: 'Hisense French Door Fridge', description: 'Premium 600L refrigerator with smart features', price: 10500, image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400', category: 'Refrigerators', rating: 4.9, reviews: 89 },
      { id: 'his-6', name: 'Hisense Chest Freezer 300L', description: 'Deep freeze chest freezer for bulk storage', price: 2400, image: 'https://images.unsplash.com/photo-1620735692151-26a7e0748f2d?w=400', category: 'Freezers', rating: 4.6, reviews: 123 },
      { id: 'his-7', name: 'Hisense 1.5HP Split AC', description: 'Inverter technology for energy efficient cooling', price: 4200, image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400', category: 'Air Conditioners', popular: true, rating: 4.7, reviews: 256 },
      { id: 'his-8', name: 'Hisense 2HP Split AC', description: 'Powerful cooling for larger rooms with fast cool', price: 5500, image: 'https://images.unsplash.com/photo-1631567091085-e990eeca2135?w=400', category: 'Air Conditioners', rating: 4.6, reviews: 178 },
      { id: 'his-9', name: 'Hisense Front Load Washer 8KG', description: 'Smart wash programs with steam cleaning', price: 4500, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400', category: 'Washing Machines', rating: 4.8, reviews: 145 },
      { id: 'his-10', name: 'Hisense Top Load Washer 10KG', description: 'Large capacity with multiple wash modes', price: 3600, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400', category: 'Washing Machines', rating: 4.5, reviews: 98 },
      { id: 'his-11', name: 'Hisense Microwave 30L', description: 'Convection microwave with grill function', price: 850, image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400', category: 'Kitchen Appliances', rating: 4.4, reviews: 234 },
      { id: 'his-12', name: 'Hisense Soundbar 2.1', description: 'Wireless subwoofer with Bluetooth connectivity', price: 1100, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', category: 'Audio', rating: 4.7, reviews: 167 },
    ],
  },
};
