/**
 * Question Trees Configuration
 * 
 * Purpose: Define all question flows for each issue category.
 * 
 * Design Principle:
 * Question trees are predefined decision trees that guide the conversation.
 * Each category has its own tree with branching logic based on answers.
 * The AI does NOT decide which questions to ask - this is rule-based.
 * 
 * Structure:
 * - Each category has a root question
 * - Questions branch based on answers
 * - Leaf nodes lead to resolution paths
 * 
 * Integration Points:
 * - Used by conversation service to determine next question
 * - Referenced by resolution service to find appropriate resolution
 */

import { Question, QuestionType, IssueCategory } from '../types';

/**
 * Question Tree
 * 
 * Represents a complete question flow for a category.
 */
export interface QuestionTree {
  category: IssueCategory;
  rootQuestionId: string;
  questions: Record<string, Question>;
}

/**
 * Order Status Question Tree
 * 
 * Flow for tracking order status inquiries.
 */
const ORDER_STATUS_TREE: QuestionTree = {
  category: IssueCategory.ORDER_STATUS,
  rootQuestionId: 'order_status_1',
  questions: {
    'order_status_1': {
      id: 'order_status_1',
      text: 'Do you have your order number?',
      type: QuestionType.YES_NO,
      nextQuestionMap: {
        'yes': 'order_status_2',
        'no': 'order_status_3'
      }
    },
    'order_status_2': {
      id: 'order_status_2',
      text: 'Please provide your order number (format: ORD-XXXXX)',
      type: QuestionType.ORDER_ID,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Order number is required'
        },
        {
          type: 'pattern',
          value: '^ORD-[0-9]{5}$',
          errorMessage: 'Order number must be in format ORD-XXXXX'
        }
      ]
    },
    'order_status_3': {
      id: 'order_status_3',
      text: 'Can you provide the email address used for the order?',
      type: QuestionType.TEXT_INPUT,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Email address is required'
        },
        {
          type: 'pattern',
          value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          errorMessage: 'Please provide a valid email address'
        }
      ]
    }
  }
};

/**
 * Delivery Problem Question Tree
 * 
 * Flow for handling delivery issues.
 */
const DELIVERY_PROBLEM_TREE: QuestionTree = {
  category: IssueCategory.DELIVERY_PROBLEM,
  rootQuestionId: 'delivery_1',
  questions: {
    'delivery_1': {
      id: 'delivery_1',
      text: 'What type of delivery problem are you experiencing?',
      type: QuestionType.SINGLE_CHOICE,
      options: [
        'Package is delayed',
        'Package delivered to wrong address',
        'Package is damaged',
        'Package is lost/missing',
        'Other delivery issue'
      ],
      nextQuestionMap: {
        'Package is delayed': 'delivery_2',
        'Package delivered to wrong address': 'delivery_3',
        'Package is damaged': 'delivery_4',
        'Package is lost/missing': 'delivery_5',
        'Other delivery issue': 'delivery_6'
      }
    },
    'delivery_2': {
      id: 'delivery_2',
      text: 'How many days past the expected delivery date is your package?',
      type: QuestionType.SINGLE_CHOICE,
      options: ['1-2 days', '3-5 days', 'More than 5 days']
    },
    'delivery_3': {
      id: 'delivery_3',
      text: 'Do you know where the package was delivered?',
      type: QuestionType.YES_NO,
      nextQuestionMap: {
        'yes': 'delivery_3a',
        'no': 'delivery_3b'
      }
    },
    'delivery_3a': {
      id: 'delivery_3a',
      text: 'Please describe the location where it was delivered',
      type: QuestionType.TEXT_INPUT
    },
    'delivery_3b': {
      id: 'delivery_3b',
      text: 'Have you checked with neighbors or building management?',
      type: QuestionType.YES_NO
    },
    'delivery_4': {
      id: 'delivery_4',
      text: 'Can you describe the damage to the package?',
      type: QuestionType.TEXT_INPUT,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Please describe the damage'
        },
        {
          type: 'minLength',
          value: 10,
          errorMessage: 'Please provide more details (at least 10 characters)'
        }
      ]
    },
    'delivery_5': {
      id: 'delivery_5',
      text: 'When was the package supposed to be delivered?',
      type: QuestionType.DATE
    },
    'delivery_6': {
      id: 'delivery_6',
      text: 'Please describe your delivery issue',
      type: QuestionType.TEXT_INPUT,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Please describe the issue'
        }
      ]
    }
  }
};

/**
 * Payment Issue Question Tree
 * 
 * Flow for handling payment problems.
 */
const PAYMENT_ISSUE_TREE: QuestionTree = {
  category: IssueCategory.PAYMENT_ISSUE,
  rootQuestionId: 'payment_1',
  questions: {
    'payment_1': {
      id: 'payment_1',
      text: 'What payment issue are you experiencing?',
      type: QuestionType.SINGLE_CHOICE,
      options: [
        'Payment was declined',
        'Charged incorrect amount',
        'Charged multiple times',
        'Payment method not accepted',
        'Other payment issue'
      ],
      nextQuestionMap: {
        'Payment was declined': 'payment_2',
        'Charged incorrect amount': 'payment_3',
        'Charged multiple times': 'payment_4',
        'Payment method not accepted': 'payment_5',
        'Other payment issue': 'payment_6'
      }
    },
    'payment_2': {
      id: 'payment_2',
      text: 'Have you verified that your payment method has sufficient funds?',
      type: QuestionType.YES_NO
    },
    'payment_3': {
      id: 'payment_3',
      text: 'What amount were you charged, and what amount did you expect?',
      type: QuestionType.TEXT_INPUT,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Please provide both amounts'
        }
      ]
    },
    'payment_4': {
      id: 'payment_4',
      text: 'How many times were you charged?',
      type: QuestionType.SINGLE_CHOICE,
      options: ['2 times', '3 times', 'More than 3 times']
    },
    'payment_5': {
      id: 'payment_5',
      text: 'Which payment method are you trying to use?',
      type: QuestionType.SINGLE_CHOICE,
      options: ['Credit Card', 'Debit Card', 'PayPal', 'Other']
    },
    'payment_6': {
      id: 'payment_6',
      text: 'Please describe your payment issue',
      type: QuestionType.TEXT_INPUT,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Please describe the issue'
        }
      ]
    }
  }
};

/**
 * Refund Request Question Tree
 * 
 * Flow for processing refund requests.
 */
const REFUND_REQUEST_TREE: QuestionTree = {
  category: IssueCategory.REFUND_REQUEST,
  rootQuestionId: 'refund_1',
  questions: {
    'refund_1': {
      id: 'refund_1',
      text: 'What is the reason for your refund request?',
      type: QuestionType.SINGLE_CHOICE,
      options: [
        'Product defective or damaged',
        'Wrong item received',
        'Changed my mind',
        'Better price elsewhere',
        'Other reason'
      ],
      nextQuestionMap: {
        'Product defective or damaged': 'refund_2',
        'Wrong item received': 'refund_3',
        'Changed my mind': 'refund_4',
        'Better price elsewhere': 'refund_4',
        'Other reason': 'refund_5'
      }
    },
    'refund_2': {
      id: 'refund_2',
      text: 'Have you already returned the item?',
      type: QuestionType.YES_NO,
      nextQuestionMap: {
        'yes': 'refund_2a',
        'no': 'refund_2b'
      }
    },
    'refund_2a': {
      id: 'refund_2a',
      text: 'Please provide the return tracking number',
      type: QuestionType.TEXT_INPUT,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Tracking number is required'
        }
      ]
    },
    'refund_2b': {
      id: 'refund_2b',
      text: 'Would you like instructions on how to return the item?',
      type: QuestionType.YES_NO
    },
    'refund_3': {
      id: 'refund_3',
      text: 'What item did you receive instead?',
      type: QuestionType.TEXT_INPUT,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Please describe what you received'
        }
      ]
    },
    'refund_4': {
      id: 'refund_4',
      text: 'Is the item still in its original packaging and unused?',
      type: QuestionType.YES_NO
    },
    'refund_5': {
      id: 'refund_5',
      text: 'Please explain your reason for the refund',
      type: QuestionType.TEXT_INPUT,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Please provide a reason'
        },
        {
          type: 'minLength',
          value: 10,
          errorMessage: 'Please provide more details'
        }
      ]
    }
  }
};

/**
 * Product Defect Question Tree
 * 
 * Flow for handling product quality issues.
 */
const PRODUCT_DEFECT_TREE: QuestionTree = {
  category: IssueCategory.PRODUCT_DEFECT,
  rootQuestionId: 'defect_1',
  questions: {
    'defect_1': {
      id: 'defect_1',
      text: 'What type of defect or issue does the product have?',
      type: QuestionType.SINGLE_CHOICE,
      options: [
        'Product is broken or damaged',
        'Product does not work as expected',
        'Missing parts or accessories',
        'Wrong product received',
        'Product different from description'
      ]
    },
    'defect_2': {
      id: 'defect_2',
      text: 'When did you first notice the defect?',
      type: QuestionType.SINGLE_CHOICE,
      options: [
        'Upon delivery',
        'Within first week',
        'After 1-2 weeks',
        'After more than 2 weeks'
      ]
    }
  }
};

/**
 * Account Access Question Tree
 * 
 * Flow for account and login issues.
 */
const ACCOUNT_ACCESS_TREE: QuestionTree = {
  category: IssueCategory.ACCOUNT_ACCESS,
  rootQuestionId: 'account_1',
  questions: {
    'account_1': {
      id: 'account_1',
      text: 'What account issue are you experiencing?',
      type: QuestionType.SINGLE_CHOICE,
      options: [
        'Forgot password',
        'Account locked',
        'Cannot receive verification email',
        'Username issues',
        'Other account issue'
      ],
      nextQuestionMap: {
        'Forgot password': 'account_2',
        'Account locked': 'account_3',
        'Cannot receive verification email': 'account_4',
        'Username issues': 'account_5',
        'Other account issue': 'account_6'
      }
    },
    'account_2': {
      id: 'account_2',
      text: 'Have you tried using the "Forgot Password" link on the login page?',
      type: QuestionType.YES_NO
    },
    'account_3': {
      id: 'account_3',
      text: 'Do you know why your account was locked?',
      type: QuestionType.YES_NO
    },
    'account_4': {
      id: 'account_4',
      text: 'Have you checked your spam/junk folder?',
      type: QuestionType.YES_NO
    },
    'account_5': {
      id: 'account_5',
      text: 'Please describe the username issue',
      type: QuestionType.TEXT_INPUT
    },
    'account_6': {
      id: 'account_6',
      text: 'Please describe your account issue',
      type: QuestionType.TEXT_INPUT,
      validationRules: [
        {
          type: 'required',
          errorMessage: 'Please describe the issue'
        }
      ]
    }
  }
};

/**
 * Cancellation Question Tree
 * 
 * Flow for order cancellation requests.
 */
const CANCELLATION_TREE: QuestionTree = {
  category: IssueCategory.CANCELLATION,
  rootQuestionId: 'cancel_1',
  questions: {
    'cancel_1': {
      id: 'cancel_1',
      text: 'Has your order already shipped?',
      type: QuestionType.YES_NO,
      nextQuestionMap: {
        'yes': 'cancel_2',
        'no': 'cancel_3'
      }
    },
    'cancel_2': {
      id: 'cancel_2',
      text: 'Since your order has shipped, would you like to refuse delivery or return it after receiving?',
      type: QuestionType.SINGLE_CHOICE,
      options: [
        'Refuse delivery',
        'Return after receiving',
        'Keep the order'
      ]
    },
    'cancel_3': {
      id: 'cancel_3',
      text: 'Your order can be cancelled. Would you like to proceed with cancellation?',
      type: QuestionType.YES_NO
    }
  }
};

/**
 * All Question Trees
 * 
 * Map of category to question tree.
 * This is the single source of truth for conversation flows.
 */
export const QUESTION_TREES: Record<IssueCategory, QuestionTree> = {
  [IssueCategory.ORDER_STATUS]: ORDER_STATUS_TREE,
  [IssueCategory.DELIVERY_PROBLEM]: DELIVERY_PROBLEM_TREE,
  [IssueCategory.PAYMENT_ISSUE]: PAYMENT_ISSUE_TREE,
  [IssueCategory.REFUND_REQUEST]: REFUND_REQUEST_TREE,
  [IssueCategory.PRODUCT_DEFECT]: PRODUCT_DEFECT_TREE,
  [IssueCategory.ACCOUNT_ACCESS]: ACCOUNT_ACCESS_TREE,
  [IssueCategory.BILLING_INQUIRY]: {
    category: IssueCategory.BILLING_INQUIRY,
    rootQuestionId: 'billing_1',
    questions: {
      'billing_1': {
        id: 'billing_1',
        text: 'What billing information do you need?',
        type: QuestionType.SINGLE_CHOICE,
        options: ['Invoice copy', 'Billing statement', 'Charge details', 'Other']
      }
    }
  },
  [IssueCategory.CANCELLATION]: CANCELLATION_TREE,
  [IssueCategory.OTHER]: {
    category: IssueCategory.OTHER,
    rootQuestionId: 'other_1',
    questions: {
      'other_1': {
        id: 'other_1',
        text: 'Please describe your issue in detail',
        type: QuestionType.TEXT_INPUT,
        validationRules: [
          {
            type: 'required',
            errorMessage: 'Please describe your issue'
          },
          {
            type: 'minLength',
            value: 20,
            errorMessage: 'Please provide more details (at least 20 characters)'
          }
        ]
      }
    }
  }
};

/**
 * Get Question Tree
 * 
 * Retrieves the question tree for a specific category.
 * 
 * @param category - The issue category
 * @returns The question tree for that category
 */
export function getQuestionTree(category: IssueCategory): QuestionTree {
  return QUESTION_TREES[category];
}

/**
 * Get Question by ID
 * 
 * Retrieves a specific question from a category's tree.
 * 
 * @param category - The issue category
 * @param questionId - The question ID
 * @returns The question, or undefined if not found
 */
export function getQuestion(category: IssueCategory, questionId: string): Question | undefined {
  const tree = QUESTION_TREES[category];
  return tree.questions[questionId];
}

/**
 * Get Next Question ID
 * 
 * Determines the next question based on the current question and answer.
 * This is pure logic - no AI involved.
 * 
 * @param category - The issue category
 * @param currentQuestionId - Current question ID
 * @param answer - User's answer
 * @returns Next question ID, or undefined if at end of tree
 */
export function getNextQuestionId(
  category: IssueCategory,
  currentQuestionId: string,
  answer: string
): string | undefined {
  const question = getQuestion(category, currentQuestionId);
  
  if (!question || !question.nextQuestionMap) {
    return undefined;
  }
  
  return question.nextQuestionMap[answer];
}
