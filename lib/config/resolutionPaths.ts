/**
 * Resolution Paths Configuration
 * 
 * Purpose: Define all predefined resolution paths for each issue category.
 * 
 * Design Principle:
 * Resolution paths are completely predefined. The AI does NOT invent solutions.
 * Each path has specific conditions that must be met (based on collected answers).
 * The system deterministically selects the appropriate path based on these conditions.
 * 
 * Integration Points:
 * - Used by resolution service to determine final outcome
 * - Gemini only generates the natural language response text
 * - All logic and decision-making is rule-based
 */

import { ResolutionPath, ResolutionType, IssueCategory } from '../types';

/**
 * Order Status Resolutions
 * 
 * Predefined resolutions for order tracking inquiries.
 */
const ORDER_STATUS_RESOLUTIONS: ResolutionPath[] = [
  {
    id: 'order_status_found',
    category: IssueCategory.ORDER_STATUS,
    type: ResolutionType.INFORMATION_PROVIDED,
    conditions: [
      {
        questionId: 'order_status_2',
        expectedAnswer: '',
        operator: 'contains'
      }
    ],
    requiresData: ['orderId'],
    estimatedTime: 'Immediate'
  },
  {
    id: 'order_status_email_lookup',
    category: IssueCategory.ORDER_STATUS,
    type: ResolutionType.INFORMATION_PROVIDED,
    conditions: [
      {
        questionId: 'order_status_3',
        expectedAnswer: '',
        operator: 'contains'
      }
    ],
    requiresData: ['email'],
    estimatedTime: 'Immediate'
  }
];

/**
 * Delivery Problem Resolutions
 * 
 * Predefined resolutions for delivery issues.
 */
const DELIVERY_PROBLEM_RESOLUTIONS: ResolutionPath[] = [
  {
    id: 'delivery_delayed_minor',
    category: IssueCategory.DELIVERY_PROBLEM,
    type: ResolutionType.INFORMATION_PROVIDED,
    conditions: [
      {
        questionId: 'delivery_1',
        expectedAnswer: 'Package is delayed',
        operator: 'equals'
      },
      {
        questionId: 'delivery_2',
        expectedAnswer: '1-2 days',
        operator: 'equals'
      }
    ],
    steps: [
      'Check tracking information for latest updates',
      'Delivery delays of 1-2 days are common due to weather or high volume',
      'Your package should arrive within the next 24-48 hours'
    ],
    estimatedTime: '24-48 hours'
  },
  {
    id: 'delivery_delayed_major',
    category: IssueCategory.DELIVERY_PROBLEM,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'delivery_1',
        expectedAnswer: 'Package is delayed',
        operator: 'equals'
      },
      {
        questionId: 'delivery_2',
        expectedAnswer: ['3-5 days', 'More than 5 days'],
        operator: 'in'
      }
    ],
    escalationReason: 'Significant delivery delay requires investigation',
    estimatedTime: '24 hours for agent response'
  },
  {
    id: 'delivery_wrong_address',
    category: IssueCategory.DELIVERY_PROBLEM,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'delivery_1',
        expectedAnswer: 'Package delivered to wrong address',
        operator: 'equals'
      }
    ],
    escalationReason: 'Wrong address delivery requires carrier investigation',
    estimatedTime: '24-48 hours for resolution'
  },
  {
    id: 'delivery_damaged',
    category: IssueCategory.DELIVERY_PROBLEM,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'delivery_1',
        expectedAnswer: 'Package is damaged',
        operator: 'equals'
      }
    ],
    escalationReason: 'Damaged package requires inspection and potential replacement',
    estimatedTime: '48 hours for resolution'
  },
  {
    id: 'delivery_lost',
    category: IssueCategory.DELIVERY_PROBLEM,
    type: ResolutionType.ESCALATE_SPECIALIST,
    conditions: [
      {
        questionId: 'delivery_1',
        expectedAnswer: 'Package is lost/missing',
        operator: 'equals'
      }
    ],
    escalationReason: 'Lost package requires carrier claim and replacement processing',
    estimatedTime: '3-5 business days'
  }
];

/**
 * Payment Issue Resolutions
 * 
 * Predefined resolutions for payment problems.
 */
const PAYMENT_ISSUE_RESOLUTIONS: ResolutionPath[] = [
  {
    id: 'payment_declined_self_service',
    category: IssueCategory.PAYMENT_ISSUE,
    type: ResolutionType.SELF_SERVICE,
    conditions: [
      {
        questionId: 'payment_1',
        expectedAnswer: 'Payment was declined',
        operator: 'equals'
      },
      {
        questionId: 'payment_2',
        expectedAnswer: 'no',
        operator: 'equals'
      }
    ],
    steps: [
      'Verify your payment method has sufficient funds',
      'Check with your bank that the card is not blocked',
      'Ensure billing address matches your bank records',
      'Try a different payment method if issue persists'
    ],
    estimatedTime: 'Immediate'
  },
  {
    id: 'payment_declined_escalate',
    category: IssueCategory.PAYMENT_ISSUE,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'payment_1',
        expectedAnswer: 'Payment was declined',
        operator: 'equals'
      },
      {
        questionId: 'payment_2',
        expectedAnswer: 'yes',
        operator: 'equals'
      }
    ],
    escalationReason: 'Payment declined despite sufficient funds - requires investigation',
    estimatedTime: '24 hours'
  },
  {
    id: 'payment_wrong_amount',
    category: IssueCategory.PAYMENT_ISSUE,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'payment_1',
        expectedAnswer: 'Charged incorrect amount',
        operator: 'equals'
      }
    ],
    escalationReason: 'Incorrect charge amount requires billing review',
    estimatedTime: '24-48 hours'
  },
  {
    id: 'payment_multiple_charges',
    category: IssueCategory.PAYMENT_ISSUE,
    type: ResolutionType.ESCALATE_SPECIALIST,
    conditions: [
      {
        questionId: 'payment_1',
        expectedAnswer: 'Charged multiple times',
        operator: 'equals'
      }
    ],
    escalationReason: 'Multiple charges require immediate refund processing',
    estimatedTime: '24 hours for refund initiation'
  }
];

/**
 * Refund Request Resolutions
 * 
 * Predefined resolutions for refund requests.
 */
const REFUND_REQUEST_RESOLUTIONS: ResolutionPath[] = [
  {
    id: 'refund_defective_returned',
    category: IssueCategory.REFUND_REQUEST,
    type: ResolutionType.AUTOMATED_ACTION,
    conditions: [
      {
        questionId: 'refund_1',
        expectedAnswer: 'Product defective or damaged',
        operator: 'equals'
      },
      {
        questionId: 'refund_2',
        expectedAnswer: 'yes',
        operator: 'equals'
      }
    ],
    steps: [
      'Refund will be processed once return is received',
      'Expected processing time: 3-5 business days after receipt',
      'Refund will be issued to original payment method'
    ],
    requiresData: ['returnTrackingNumber'],
    estimatedTime: '3-5 business days after return receipt'
  },
  {
    id: 'refund_defective_not_returned',
    category: IssueCategory.REFUND_REQUEST,
    type: ResolutionType.SELF_SERVICE,
    conditions: [
      {
        questionId: 'refund_1',
        expectedAnswer: 'Product defective or damaged',
        operator: 'equals'
      },
      {
        questionId: 'refund_2',
        expectedAnswer: 'no',
        operator: 'equals'
      },
      {
        questionId: 'refund_2b',
        expectedAnswer: 'yes',
        operator: 'equals'
      }
    ],
    steps: [
      'Print the prepaid return label from your order page',
      'Package the item securely in original packaging if possible',
      'Attach the label and drop off at any carrier location',
      'Refund will be processed 3-5 days after we receive the return'
    ],
    estimatedTime: '7-10 business days total'
  },
  {
    id: 'refund_changed_mind_eligible',
    category: IssueCategory.REFUND_REQUEST,
    type: ResolutionType.SELF_SERVICE,
    conditions: [
      {
        questionId: 'refund_1',
        expectedAnswer: ['Changed my mind', 'Better price elsewhere'],
        operator: 'in'
      },
      {
        questionId: 'refund_4',
        expectedAnswer: 'yes',
        operator: 'equals'
      }
    ],
    steps: [
      'You can return the item within 30 days of purchase',
      'Item must be unused and in original packaging',
      'Print return label from your order page',
      'Refund will be processed minus original shipping cost'
    ],
    estimatedTime: '7-10 business days'
  },
  {
    id: 'refund_changed_mind_ineligible',
    category: IssueCategory.REFUND_REQUEST,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'refund_1',
        expectedAnswer: ['Changed my mind', 'Better price elsewhere'],
        operator: 'in'
      },
      {
        questionId: 'refund_4',
        expectedAnswer: 'no',
        operator: 'equals'
      }
    ],
    escalationReason: 'Item not in original condition - requires case-by-case review',
    estimatedTime: '24-48 hours'
  }
];

/**
 * Product Defect Resolutions
 * 
 * Predefined resolutions for product quality issues.
 */
const PRODUCT_DEFECT_RESOLUTIONS: ResolutionPath[] = [
  {
    id: 'defect_immediate',
    category: IssueCategory.PRODUCT_DEFECT,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'defect_2',
        expectedAnswer: 'Upon delivery',
        operator: 'equals'
      }
    ],
    escalationReason: 'Defect upon delivery - eligible for immediate replacement',
    estimatedTime: '24 hours for replacement processing'
  },
  {
    id: 'defect_warranty',
    category: IssueCategory.PRODUCT_DEFECT,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'defect_2',
        expectedAnswer: ['Within first week', 'After 1-2 weeks'],
        operator: 'in'
      }
    ],
    escalationReason: 'Product defect within warranty period',
    estimatedTime: '48 hours for resolution'
  },
  {
    id: 'defect_late',
    category: IssueCategory.PRODUCT_DEFECT,
    type: ResolutionType.ESCALATE_SPECIALIST,
    conditions: [
      {
        questionId: 'defect_2',
        expectedAnswer: 'After more than 2 weeks',
        operator: 'equals'
      }
    ],
    escalationReason: 'Late defect report - requires warranty verification',
    estimatedTime: '3-5 business days'
  }
];

/**
 * Account Access Resolutions
 * 
 * Predefined resolutions for account issues.
 */
const ACCOUNT_ACCESS_RESOLUTIONS: ResolutionPath[] = [
  {
    id: 'account_password_self_service',
    category: IssueCategory.ACCOUNT_ACCESS,
    type: ResolutionType.SELF_SERVICE,
    conditions: [
      {
        questionId: 'account_1',
        expectedAnswer: 'Forgot password',
        operator: 'equals'
      },
      {
        questionId: 'account_2',
        expectedAnswer: 'no',
        operator: 'equals'
      }
    ],
    steps: [
      'Go to the login page',
      'Click "Forgot Password" link',
      'Enter your email address',
      'Check your email for reset link (check spam folder)',
      'Follow the link to create a new password'
    ],
    estimatedTime: 'Immediate'
  },
  {
    id: 'account_password_escalate',
    category: IssueCategory.ACCOUNT_ACCESS,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'account_1',
        expectedAnswer: 'Forgot password',
        operator: 'equals'
      },
      {
        questionId: 'account_2',
        expectedAnswer: 'yes',
        operator: 'equals'
      }
    ],
    escalationReason: 'Password reset not working - requires manual intervention',
    estimatedTime: '2-4 hours'
  },
  {
    id: 'account_locked',
    category: IssueCategory.ACCOUNT_ACCESS,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'account_1',
        expectedAnswer: 'Account locked',
        operator: 'equals'
      }
    ],
    escalationReason: 'Account locked - requires security review and unlock',
    estimatedTime: '4-6 hours'
  },
  {
    id: 'account_email_issue',
    category: IssueCategory.ACCOUNT_ACCESS,
    type: ResolutionType.SELF_SERVICE,
    conditions: [
      {
        questionId: 'account_1',
        expectedAnswer: 'Cannot receive verification email',
        operator: 'equals'
      },
      {
        questionId: 'account_4',
        expectedAnswer: 'no',
        operator: 'equals'
      }
    ],
    steps: [
      'Check your spam/junk folder',
      'Add noreply@shopease.com to your contacts',
      'Check if your email provider is blocking our emails',
      'Try requesting a new verification email'
    ],
    estimatedTime: 'Immediate'
  }
];

/**
 * Cancellation Resolutions
 * 
 * Predefined resolutions for order cancellations.
 */
const CANCELLATION_RESOLUTIONS: ResolutionPath[] = [
  {
    id: 'cancel_not_shipped',
    category: IssueCategory.CANCELLATION,
    type: ResolutionType.AUTOMATED_ACTION,
    conditions: [
      {
        questionId: 'cancel_1',
        expectedAnswer: 'no',
        operator: 'equals'
      },
      {
        questionId: 'cancel_3',
        expectedAnswer: 'yes',
        operator: 'equals'
      }
    ],
    steps: [
      'Your order has been cancelled',
      'Refund will be processed within 3-5 business days',
      'You will receive a confirmation email shortly'
    ],
    estimatedTime: '3-5 business days for refund'
  },
  {
    id: 'cancel_shipped_refuse',
    category: IssueCategory.CANCELLATION,
    type: ResolutionType.SELF_SERVICE,
    conditions: [
      {
        questionId: 'cancel_1',
        expectedAnswer: 'yes',
        operator: 'equals'
      },
      {
        questionId: 'cancel_2',
        expectedAnswer: 'Refuse delivery',
        operator: 'equals'
      }
    ],
    steps: [
      'When the carrier attempts delivery, refuse to accept the package',
      'The package will be returned to us automatically',
      'Refund will be processed once we receive the return',
      'Expected timeline: 7-10 business days'
    ],
    estimatedTime: '7-10 business days'
  },
  {
    id: 'cancel_shipped_return',
    category: IssueCategory.CANCELLATION,
    type: ResolutionType.SELF_SERVICE,
    conditions: [
      {
        questionId: 'cancel_1',
        expectedAnswer: 'yes',
        operator: 'equals'
      },
      {
        questionId: 'cancel_2',
        expectedAnswer: 'Return after receiving',
        operator: 'equals'
      }
    ],
    steps: [
      'Accept the delivery when it arrives',
      'Initiate a return from your order page',
      'Print the prepaid return label',
      'Ship the item back to us',
      'Refund will be processed after we receive it'
    ],
    estimatedTime: '10-14 business days'
  }
];

/**
 * Billing Inquiry Resolutions
 * 
 * Predefined resolutions for billing questions.
 */
const BILLING_INQUIRY_RESOLUTIONS: ResolutionPath[] = [
  {
    id: 'billing_invoice',
    category: IssueCategory.BILLING_INQUIRY,
    type: ResolutionType.SELF_SERVICE,
    conditions: [
      {
        questionId: 'billing_1',
        expectedAnswer: 'Invoice copy',
        operator: 'equals'
      }
    ],
    steps: [
      'Log in to your account',
      'Go to Order History',
      'Click on the order you need an invoice for',
      'Click "Download Invoice" button',
      'Invoice will be downloaded as PDF'
    ],
    estimatedTime: 'Immediate'
  },
  {
    id: 'billing_other',
    category: IssueCategory.BILLING_INQUIRY,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [
      {
        questionId: 'billing_1',
        expectedAnswer: ['Billing statement', 'Charge details', 'Other'],
        operator: 'in'
      }
    ],
    escalationReason: 'Billing inquiry requires detailed account review',
    estimatedTime: '24 hours'
  }
];

/**
 * Other Issues Resolutions
 * 
 * Fallback resolutions for uncategorized issues.
 */
const OTHER_RESOLUTIONS: ResolutionPath[] = [
  {
    id: 'other_escalate',
    category: IssueCategory.OTHER,
    type: ResolutionType.ESCALATE_AGENT,
    conditions: [],
    escalationReason: 'Issue does not fit predefined categories - requires human review',
    estimatedTime: '24-48 hours'
  }
];

/**
 * All Resolution Paths
 * 
 * Complete mapping of categories to their resolution paths.
 * This is the single source of truth for issue resolution.
 */
export const RESOLUTION_PATHS: Record<IssueCategory, ResolutionPath[]> = {
  [IssueCategory.ORDER_STATUS]: ORDER_STATUS_RESOLUTIONS,
  [IssueCategory.DELIVERY_PROBLEM]: DELIVERY_PROBLEM_RESOLUTIONS,
  [IssueCategory.PAYMENT_ISSUE]: PAYMENT_ISSUE_RESOLUTIONS,
  [IssueCategory.REFUND_REQUEST]: REFUND_REQUEST_RESOLUTIONS,
  [IssueCategory.PRODUCT_DEFECT]: PRODUCT_DEFECT_RESOLUTIONS,
  [IssueCategory.ACCOUNT_ACCESS]: ACCOUNT_ACCESS_RESOLUTIONS,
  [IssueCategory.BILLING_INQUIRY]: BILLING_INQUIRY_RESOLUTIONS,
  [IssueCategory.CANCELLATION]: CANCELLATION_RESOLUTIONS,
  [IssueCategory.OTHER]: OTHER_RESOLUTIONS
};

/**
 * Find Matching Resolution
 * 
 * Deterministically finds the appropriate resolution path based on collected answers.
 * This is pure logic - no AI involved in the decision.
 * 
 * @param category - The issue category
 * @param answers - Collected answers from the conversation
 * @returns The matching resolution path, or undefined if no match
 */
export function findMatchingResolution(
  category: IssueCategory,
  answers: Record<string, string>
): ResolutionPath | undefined {
  const paths = RESOLUTION_PATHS[category];
  
  // Find the first path where all conditions are met
  for (const path of paths) {
    if (checkConditions(path.conditions, answers)) {
      return path;
    }
  }
  
  // If no specific path matches, return a generic escalation
  return paths[paths.length - 1]; // Last path is usually the fallback
}

/**
 * Check Conditions
 * 
 * Checks if all conditions for a resolution path are met.
 * Pure deterministic logic.
 * 
 * @param conditions - Array of conditions to check
 * @param answers - User's answers
 * @returns True if all conditions are met
 */
function checkConditions(
  conditions: ResolutionPath['conditions'],
  answers: Record<string, string>
): boolean {
  // If no conditions, path always matches
  if (conditions.length === 0) {
    return true;
  }
  
  // Check each condition
  for (const condition of conditions) {
    const userAnswer = answers[condition.questionId];
    
    // If answer not provided, condition fails
    if (!userAnswer) {
      return false;
    }
    
    // Check based on operator
    switch (condition.operator) {
      case 'equals':
        if (userAnswer !== condition.expectedAnswer) {
          return false;
        }
        break;
        
      case 'contains':
        if (typeof condition.expectedAnswer === 'string' && 
            !userAnswer.includes(condition.expectedAnswer)) {
          return false;
        }
        break;
        
      case 'in':
        if (Array.isArray(condition.expectedAnswer) && 
            !condition.expectedAnswer.includes(userAnswer)) {
          return false;
        }
        break;
        
      case 'greaterThan':
      case 'lessThan':
        // Numeric comparisons (if needed in future)
        break;
    }
  }
  
  return true;
}

/**
 * Get Resolution Paths for Category
 * 
 * Returns all possible resolution paths for a category.
 * 
 * @param category - The issue category
 * @returns Array of resolution paths
 */
export function getResolutionPaths(category: IssueCategory): ResolutionPath[] {
  return RESOLUTION_PATHS[category];
}
