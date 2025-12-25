/**
 * Order Data
 * 
 * Purpose: Hardcoded order data for demonstrating order history and tracking.
 * 
 * Design:
 * - Fake order history for logged-in users
 * - Various order statuses
 * - Realistic order information
 * 
 * Note: This is static data for demonstration purposes.
 */

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: string;
  orderDate: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

/**
 * Fake Order History
 * 
 * Hardcoded orders for demonstration.
 */
export const ORDERS: Order[] = [
  {
    orderId: 'ORD-12345',
    orderDate: '2025-12-20',
    status: 'Shipped',
    items: [
      {
        productId: 'PROD-001',
        productName: 'Wireless Bluetooth Headphones',
        quantity: 1,
        price: 7499
      }
    ],
    subtotal: 7499,
    shipping: 499,
    tax: 598,
    total: 8596,
    shippingAddress: '123 Main St, Anytown, ST 12345',
    trackingNumber: 'TRK-9876543210',
    estimatedDelivery: '2025-12-27'
  },
  {
    orderId: 'ORD-12346',
    orderDate: '2025-12-18',
    status: 'Delivered',
    items: [
      {
        productId: 'PROD-005',
        productName: 'Classic Cotton T-Shirt',
        quantity: 2,
        price: 1659
      },
      {
        productId: 'PROD-007',
        productName: 'Running Shoes',
        quantity: 1,
        price: 7469
      }
    ],
    subtotal: 10787,
    shipping: 0,
    tax: 863,
    total: 11650,
    shippingAddress: '123 Main St, Anytown, ST 12345',
    trackingNumber: 'TRK-9876543211',
    estimatedDelivery: '2025-12-22'
  },
  {
    orderId: 'ORD-12347',
    orderDate: '2025-12-15',
    status: 'Processing',
    items: [
      {
        productId: 'PROD-013',
        productName: 'The Art of Programming',
        quantity: 1,
        price: 3319
      }
    ],
    subtotal: 3319,
    shipping: 331,
    tax: 266,
    total: 3916,
    shippingAddress: '123 Main St, Anytown, ST 12345',
    estimatedDelivery: '2025-12-28'
  }
];

/**
 * Get Order by ID
 * 
 * @param orderId - Order ID
 * @returns Order or undefined
 */
export function getOrderById(orderId: string): Order | undefined {
  return ORDERS.find(order => order.orderId === orderId);
}

/**
 * Get All Orders
 * 
 * @returns Array of all orders
 */
export function getAllOrders(): Order[] {
  return ORDERS;
}
