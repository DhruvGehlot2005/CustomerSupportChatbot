/**
 * Issue Category Definitions
 * 
 * Purpose: Define all predefined issue categories with their descriptions and keywords.
 * 
 * Design Principle:
 * These are the ONLY categories the system can handle. The AI cannot invent new categories.
 * Each category has keywords to help with classification, but final decisions are rule-based.
 * 
 * Integration Points:
 * - Used by classification service to map user input to categories
 * - Used by Gemini prompts to constrain classification
 * - Referenced by question trees and resolution paths
 */

import { IssueCategory } from '../types';

/**
 * Category Metadata
 * 
 * Detailed information about each issue category.
 */
export interface CategoryMetadata {
  category: IssueCategory;
  displayName: string;
  description: string;
  keywords: string[]; // Keywords that suggest this category
  examples: string[]; // Example user queries
  priority: 'low' | 'medium' | 'high'; // Default priority level
}

/**
 * All Issue Categories
 * 
 * Complete list of categories the system can handle.
 * This is the single source of truth for issue classification.
 */
export const ISSUE_CATEGORIES: Record<IssueCategory, CategoryMetadata> = {
  [IssueCategory.ORDER_STATUS]: {
    category: IssueCategory.ORDER_STATUS,
    displayName: 'Order Status',
    description: 'Questions about order tracking, shipping status, or delivery timeline',
    keywords: [
      'order', 'tracking', 'shipped', 'delivery', 'status', 'where is',
      'when will', 'arrive', 'eta', 'tracking number', 'package'
    ],
    examples: [
      'Where is my order?',
      'When will my package arrive?',
      'Can I track my order?',
      'What is the status of order #12345?'
    ],
    priority: 'medium'
  },

  [IssueCategory.DELIVERY_PROBLEM]: {
    category: IssueCategory.DELIVERY_PROBLEM,
    displayName: 'Delivery Problem',
    description: 'Issues with delivery such as delays, wrong address, or failed delivery',
    keywords: [
      'delivery', 'delayed', 'late', 'wrong address', 'not delivered',
      'missing', 'lost', 'damaged', 'failed delivery', 'courier'
    ],
    examples: [
      'My package is delayed',
      'Delivery to wrong address',
      'Package not delivered',
      'My order is lost'
    ],
    priority: 'high'
  },

  [IssueCategory.PAYMENT_ISSUE]: {
    category: IssueCategory.PAYMENT_ISSUE,
    displayName: 'Payment Issue',
    description: 'Problems with payment processing, charges, or payment methods',
    keywords: [
      'payment', 'charged', 'credit card', 'declined', 'failed',
      'double charged', 'billing', 'transaction', 'pay', 'charge'
    ],
    examples: [
      'My payment was declined',
      'I was charged twice',
      'Payment not going through',
      'Wrong amount charged'
    ],
    priority: 'high'
  },

  [IssueCategory.REFUND_REQUEST]: {
    category: IssueCategory.REFUND_REQUEST,
    displayName: 'Refund Request',
    description: 'Requests for refunds or questions about refund status',
    keywords: [
      'refund', 'money back', 'return', 'reimbursement', 'refund status',
      'when will i get', 'refund policy', 'get my money'
    ],
    examples: [
      'I want a refund',
      'When will I get my refund?',
      'How do I request a refund?',
      'Refund not received'
    ],
    priority: 'high'
  },

  [IssueCategory.PRODUCT_DEFECT]: {
    category: IssueCategory.PRODUCT_DEFECT,
    displayName: 'Product Defect',
    description: 'Issues with product quality, defects, or wrong item received',
    keywords: [
      'defective', 'broken', 'damaged', 'wrong item', 'not working',
      'faulty', 'quality', 'defect', 'incorrect', 'different'
    ],
    examples: [
      'Product is defective',
      'Received wrong item',
      'Item is broken',
      'Product not as described'
    ],
    priority: 'high'
  },

  [IssueCategory.ACCOUNT_ACCESS]: {
    category: IssueCategory.ACCOUNT_ACCESS,
    displayName: 'Account Access',
    description: 'Problems accessing account, login issues, or password reset',
    keywords: [
      'login', 'password', 'account', 'access', 'locked', 'reset',
      'forgot password', 'cant login', 'sign in', 'username'
    ],
    examples: [
      'Cannot login to my account',
      'Forgot my password',
      'Account is locked',
      'Need to reset password'
    ],
    priority: 'medium'
  },

  [IssueCategory.BILLING_INQUIRY]: {
    category: IssueCategory.BILLING_INQUIRY,
    displayName: 'Billing Inquiry',
    description: 'Questions about invoices, billing statements, or charges',
    keywords: [
      'invoice', 'bill', 'statement', 'receipt', 'billing',
      'charge details', 'invoice copy', 'billing history'
    ],
    examples: [
      'Need a copy of my invoice',
      'Question about my bill',
      'Billing statement incorrect',
      'Where is my receipt?'
    ],
    priority: 'low'
  },

  [IssueCategory.CANCELLATION]: {
    category: IssueCategory.CANCELLATION,
    displayName: 'Order Cancellation',
    description: 'Requests to cancel orders or questions about cancellation',
    keywords: [
      'cancel', 'cancellation', 'cancel order', 'dont want',
      'stop order', 'cancel my order', 'cancel subscription'
    ],
    examples: [
      'I want to cancel my order',
      'How do I cancel?',
      'Can I cancel my order?',
      'Need to cancel order #12345'
    ],
    priority: 'high'
  },

  [IssueCategory.OTHER]: {
    category: IssueCategory.OTHER,
    displayName: 'Other',
    description: 'Issues that do not fit into predefined categories',
    keywords: [
      'other', 'general', 'question', 'help', 'support', 'inquiry'
    ],
    examples: [
      'General question',
      'Need help with something else',
      'Other issue'
    ],
    priority: 'medium'
  }
};

/**
 * Get Category by Name
 * 
 * Helper function to retrieve category metadata.
 * 
 * @param category - The issue category enum value
 * @returns Category metadata
 */
export function getCategoryMetadata(category: IssueCategory): CategoryMetadata {
  return ISSUE_CATEGORIES[category];
}

/**
 * Get All Categories
 * 
 * Returns array of all category metadata.
 * Useful for displaying options or iterating through categories.
 * 
 * @returns Array of all category metadata
 */
export function getAllCategories(): CategoryMetadata[] {
  return Object.values(ISSUE_CATEGORIES);
}

/**
 * Get Category Display Names
 * 
 * Returns mapping of category enum to display name.
 * Used for UI display purposes.
 * 
 * @returns Record of category to display name
 */
export function getCategoryDisplayNames(): Record<IssueCategory, string> {
  const displayNames: Partial<Record<IssueCategory, string>> = {};
  
  for (const [key, value] of Object.entries(ISSUE_CATEGORIES)) {
    displayNames[key as IssueCategory] = value.displayName;
  }
  
  return displayNames as Record<IssueCategory, string>;
}
