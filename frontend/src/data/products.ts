/**
 * Product Data
 * 
 * Purpose: Hardcoded product data for the dummy e-commerce website.
 * 
 * Design:
 * - Realistic product information
 * - Multiple categories
 * - Various price points
 * - Product images (using placeholder service)
 * 
 * Note: This is static data for demonstration purposes.
 * In a real application, this would come from a database.
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // For showing discounts
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  features: string[];
}

/**
 * Product Categories
 */
export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games'
] as const;

/**
 * All Products
 * 
 * Hardcoded product catalog for the demo store.
 */
export const PRODUCTS: Product[] = [
  // Electronics
  {
    id: 'PROD-001',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life. Crystal clear sound quality with deep bass and comfortable over-ear design.',
    price: 7499,
    originalPrice: 10799,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    rating: 4.5,
    reviewCount: 1234,
    inStock: true,
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Bluetooth 5.0',
      'Foldable design',
      'Built-in microphone'
    ]
  },
  {
    id: 'PROD-002',
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, GPS, and water resistance. Track your health and stay connected.',
    price: 16599,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    rating: 4.7,
    reviewCount: 856,
    inStock: true,
    features: [
      'Heart rate monitoring',
      'GPS tracking',
      'Water resistant (50m)',
      '7-day battery life',
      'Sleep tracking'
    ]
  },
  {
    id: 'PROD-003',
    name: 'Portable Bluetooth Speaker',
    description: '360-degree sound with powerful bass. Waterproof design perfect for outdoor adventures. 12-hour playtime on a single charge.',
    price: 4149,
    originalPrice: 6639,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    rating: 4.3,
    reviewCount: 432,
    inStock: true,
    features: [
      'Waterproof (IPX7)',
      '12-hour battery',
      '360-degree sound',
      'Bluetooth 5.0',
      'Built-in microphone'
    ]
  },
  {
    id: 'PROD-004',
    name: '4K Webcam',
    description: 'Professional 4K webcam with auto-focus and built-in ring light. Perfect for video calls, streaming, and content creation.',
    price: 6639,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500&h=500&fit=crop',
    rating: 4.6,
    reviewCount: 289,
    inStock: false,
    features: [
      '4K resolution',
      'Auto-focus',
      'Built-in ring light',
      'Dual microphones',
      'USB plug-and-play'
    ]
  },

  // Clothing
  {
    id: 'PROD-005',
    name: 'Classic Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt in various colors. Perfect for everyday wear with a relaxed fit.',
    price: 1659,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    rating: 4.4,
    reviewCount: 567,
    inStock: true,
    features: [
      '100% cotton',
      'Machine washable',
      'Available in 8 colors',
      'Sizes XS-XXL',
      'Pre-shrunk'
    ]
  },
  {
    id: 'PROD-006',
    name: 'Denim Jacket',
    description: 'Classic denim jacket with a modern fit. Durable construction with button closure and multiple pockets.',
    price: 5809,
    originalPrice: 8299,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    features: [
      'Premium denim',
      'Button closure',
      'Multiple pockets',
      'Classic fit',
      'Machine washable'
    ]
  },
  {
    id: 'PROD-007',
    name: 'Running Shoes',
    description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper. Designed for comfort and performance.',
    price: 7469,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    rating: 4.6,
    reviewCount: 892,
    inStock: true,
    features: [
      'Breathable mesh',
      'Responsive cushioning',
      'Lightweight design',
      'Durable outsole',
      'Available in multiple colors'
    ]
  },

  // Home & Garden
  {
    id: 'PROD-008',
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 elegant ceramic coffee mugs. Microwave and dishwasher safe. Perfect for your morning coffee or tea.',
    price: 2489,
    category: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop',
    rating: 4.5,
    reviewCount: 345,
    inStock: true,
    features: [
      'Set of 4 mugs',
      'Ceramic construction',
      'Microwave safe',
      'Dishwasher safe',
      '12 oz capacity'
    ]
  },
  {
    id: 'PROD-009',
    name: 'Indoor Plant Collection',
    description: 'Collection of 3 easy-care indoor plants. Includes decorative pots and care instructions. Perfect for home or office.',
    price: 3319,
    category: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop',
    rating: 4.7,
    reviewCount: 178,
    inStock: true,
    features: [
      '3 plants included',
      'Decorative pots',
      'Care instructions',
      'Low maintenance',
      'Air purifying'
    ]
  },
  {
    id: 'PROD-010',
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with touch controls and USB charging port. Energy-efficient with multiple brightness levels.',
    price: 2904,
    originalPrice: 4149,
    category: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
    rating: 4.4,
    reviewCount: 456,
    inStock: true,
    features: [
      'Adjustable arm',
      'Touch controls',
      'USB charging port',
      '5 brightness levels',
      'Energy efficient LED'
    ]
  },

  // Sports & Outdoors
  {
    id: 'PROD-011',
    name: 'Yoga Mat Premium',
    description: 'Extra thick yoga mat with non-slip surface. Includes carrying strap. Perfect for yoga, pilates, and floor exercises.',
    price: 2489,
    category: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
    rating: 4.6,
    reviewCount: 678,
    inStock: true,
    features: [
      'Extra thick (6mm)',
      'Non-slip surface',
      'Carrying strap included',
      'Easy to clean',
      'Eco-friendly material'
    ]
  },
  {
    id: 'PROD-012',
    name: 'Camping Tent 4-Person',
    description: 'Spacious 4-person camping tent with waterproof design. Easy setup with color-coded poles. Includes carrying bag.',
    price: 10789,
    originalPrice: 14939,
    category: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&h=500&fit=crop',
    rating: 4.5,
    reviewCount: 234,
    inStock: true,
    features: [
      'Sleeps 4 people',
      'Waterproof',
      'Easy setup',
      'Mesh windows',
      'Carrying bag included'
    ]
  },

  // Books
  {
    id: 'PROD-013',
    name: 'The Art of Programming',
    description: 'Comprehensive guide to modern programming practices. Covers design patterns, best practices, and real-world examples.',
    price: 3319,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=500&fit=crop',
    rating: 4.8,
    reviewCount: 1567,
    inStock: true,
    features: [
      'Hardcover edition',
      '500+ pages',
      'Code examples',
      'Expert author',
      'Updated for 2025'
    ]
  },
  {
    id: 'PROD-014',
    name: 'Cookbook: Healthy Meals',
    description: 'Collection of 100+ healthy and delicious recipes. Includes nutritional information and beautiful photography.',
    price: 2074,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop',
    rating: 4.7,
    reviewCount: 432,
    inStock: true,
    features: [
      '100+ recipes',
      'Full-color photos',
      'Nutritional info',
      'Easy to follow',
      'Dietary options'
    ]
  },

  // Toys & Games
  {
    id: 'PROD-015',
    name: 'Building Blocks Set',
    description: '500-piece building blocks set. Compatible with major brands. Includes storage box and instruction booklet.',
    price: 2904,
    category: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&h=500&fit=crop',
    rating: 4.9,
    reviewCount: 789,
    inStock: true,
    features: [
      '500 pieces',
      'Compatible with major brands',
      'Storage box included',
      'Ages 6+',
      'Educational'
    ]
  },
  {
    id: 'PROD-016',
    name: 'Board Game: Strategy Quest',
    description: 'Award-winning strategy board game for 2-4 players. Average playtime 60 minutes. Perfect for game nights.',
    price: 3734,
    category: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500&h=500&fit=crop',
    rating: 4.8,
    reviewCount: 567,
    inStock: true,
    features: [
      '2-4 players',
      '60 min playtime',
      'Award winning',
      'Ages 12+',
      'High replay value'
    ]
  }
];

/**
 * Get Product by ID
 * 
 * @param id - Product ID
 * @returns Product or undefined
 */
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(product => product.id === id);
}

/**
 * Get Products by Category
 * 
 * @param category - Category name
 * @returns Array of products in that category
 */
export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter(product => product.category === category);
}

/**
 * Search Products
 * 
 * @param query - Search query
 * @returns Array of matching products
 */
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get Featured Products
 * 
 * @returns Array of featured products (high rated, in stock)
 */
export function getFeaturedProducts(): Product[] {
  return PRODUCTS
    .filter(product => product.inStock && product.rating >= 4.5)
    .slice(0, 6);
}
