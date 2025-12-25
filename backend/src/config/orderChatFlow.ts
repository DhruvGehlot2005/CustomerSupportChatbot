/**
 * Order-Specific Chat Flow Configuration
 * 
 * Purpose: Define structured option-based conversation flows for order support.
 * 
 * Design:
 * - No free text input, only option selection
 * - Order context is passed at initialization
 * - Predefined decision trees for each issue type
 * - Clear resolution paths
 */

export interface ChatOption {
  id: string;
  text: string;
  nextStep?: string; // Next step ID or 'RESOLVE' or 'ESCALATE'
  resolutionMessage?: string;
  escalationReason?: string;
}

export interface ChatStep {
  id: string;
  message: string;
  options: ChatOption[];
}

/**
 * Initial Greeting Step
 * 
 * Dynamically generated based on order details
 */
export function generateInitialGreeting(
  customerName: string,
  productName: string,
  deliveryStatus: 'delivered' | 'in_transit' | 'processing',
  deliveryDate?: string
): ChatStep {
  let statusMessage = '';
  
  if (deliveryStatus === 'delivered' && deliveryDate) {
    statusMessage = `has been delivered on ${deliveryDate}`;
  } else if (deliveryStatus === 'in_transit' && deliveryDate) {
    statusMessage = `is expected to be delivered on ${deliveryDate}`;
  } else {
    statusMessage = `is currently being processed`;
  }
  
  return {
    id: 'initial',
    message: `Hi ${customerName}, the order you placed for ${productName} ${statusMessage}.\n\nDo you have any query?`,
    options: [
      {
        id: 'yes_query',
        text: 'Yes, I have a query',
        nextStep: 'main_menu'
      },
      {
        id: 'no_query',
        text: 'No, end chat',
        nextStep: 'RESOLVE',
        resolutionMessage: 'Thank you for contacting us! Have a great day!'
      }
    ]
  };
}

/**
 * Main Menu - Primary Issue Categories
 */
export const MAIN_MENU: ChatStep = {
  id: 'main_menu',
  message: 'Please select the type of issue you\'re facing:',
  options: [
    {
      id: 'issue_with_item',
      text: 'Issue with item',
      nextStep: 'issue_with_item_menu'
    },
    {
      id: 'did_not_get_item',
      text: 'Did not get the item',
      nextStep: 'did_not_get_item_menu'
    },
    {
      id: 'return_exchange',
      text: 'Return or exchange the item',
      nextStep: 'return_exchange_menu'
    },
    {
      id: 'feedback_delivery',
      text: 'Feedback on delivery executive',
      nextStep: 'feedback_menu'
    },
    {
      id: 'download_invoice',
      text: 'Download invoice',
      nextStep: 'RESOLVE',
      resolutionMessage: 'Your invoice has been sent to your registered email address. You can also download it from your order details page.'
    },
    {
      id: 'other_issue',
      text: 'Other issue',
      nextStep: 'other_issue_menu'
    },
    {
      id: 'end_chat',
      text: 'End chat',
      nextStep: 'RESOLVE',
      resolutionMessage: 'Thank you for contacting us! If you need further assistance, feel free to reach out again.'
    }
  ]
};

/**
 * Issue with Item - Submenu
 */
export const ISSUE_WITH_ITEM_MENU: ChatStep = {
  id: 'issue_with_item_menu',
  message: 'What kind of issue are you experiencing with the item?',
  options: [
    {
      id: 'wrong_product',
      text: 'I received wrong product',
      nextStep: 'wrong_product_flow'
    },
    {
      id: 'image_mismatch',
      text: 'Product image doesn\'t match the catalogue',
      nextStep: 'image_mismatch_flow'
    },
    {
      id: 'missing_item',
      text: 'Missing an item in the product or complete product',
      nextStep: 'missing_item_flow'
    },
    {
      id: 'damaged_product',
      text: 'Product is damaged or defective',
      nextStep: 'damaged_product_flow'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    },
    {
      id: 'end_chat',
      text: 'End chat',
      nextStep: 'RESOLVE',
      resolutionMessage: 'Thank you for contacting us!'
    }
  ]
};

/**
 * Wrong Product Flow
 */
export const WRONG_PRODUCT_FLOW: ChatStep = {
  id: 'wrong_product_flow',
  message: 'I\'m sorry you received the wrong product. We\'ll help you resolve this immediately.',
  options: [
    {
      id: 'initiate_return',
      text: 'Initiate return and get refund',
      nextStep: 'ESCALATE',
      escalationReason: 'Wrong product received - Return and refund requested',
      resolutionMessage: 'I\'ve initiated a return request for you. Our team will contact you within 24 hours to arrange pickup. You\'ll receive a full refund within 5-7 business days after we receive the item back.\n\nTicket #TKT-{timestamp} has been created for your reference.'
    },
    {
      id: 'exchange_correct',
      text: 'Exchange for correct product',
      nextStep: 'ESCALATE',
      escalationReason: 'Wrong product received - Exchange requested',
      resolutionMessage: 'I\'ve initiated an exchange request for you. Our team will contact you within 24 hours to arrange pickup of the wrong item and delivery of the correct product.\n\nTicket #TKT-{timestamp} has been created for your reference.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Image Mismatch Flow
 */
export const IMAGE_MISMATCH_FLOW: ChatStep = {
  id: 'image_mismatch_flow',
  message: 'I understand the product doesn\'t match what was shown. Let\'s resolve this for you.',
  options: [
    {
      id: 'return_refund',
      text: 'Return and get refund',
      nextStep: 'ESCALATE',
      escalationReason: 'Product doesn\'t match catalogue - Return requested',
      resolutionMessage: 'I\'ve initiated a return request. Our team will arrange pickup within 24 hours. You\'ll receive a full refund within 5-7 business days.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'keep_discount',
      text: 'Keep product with partial refund',
      nextStep: 'ESCALATE',
      escalationReason: 'Product mismatch - Partial refund requested',
      resolutionMessage: 'I\'ve forwarded your request for a partial refund. Our team will review and contact you within 24 hours with a compensation offer.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Missing Item Flow
 */
export const MISSING_ITEM_FLOW: ChatStep = {
  id: 'missing_item_flow',
  message: 'I\'m sorry about the missing item. We\'ll resolve this right away.',
  options: [
    {
      id: 'send_missing',
      text: 'Send the missing item',
      nextStep: 'ESCALATE',
      escalationReason: 'Missing item - Replacement requested',
      resolutionMessage: 'I\'ve created a request to send you the missing item. It will be dispatched within 24 hours and delivered in 3-5 business days at no extra cost.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'full_refund',
      text: 'Get full refund',
      nextStep: 'ESCALATE',
      escalationReason: 'Missing item - Full refund requested',
      resolutionMessage: 'I\'ve initiated a full refund for your order. You\'ll receive the refund within 5-7 business days. You can keep the items you received.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Damaged Product Flow
 */
export const DAMAGED_PRODUCT_FLOW: ChatStep = {
  id: 'damaged_product_flow',
  message: 'I apologize for receiving a damaged product. Let\'s get this fixed for you.',
  options: [
    {
      id: 'replacement',
      text: 'Get replacement product',
      nextStep: 'ESCALATE',
      escalationReason: 'Damaged product - Replacement requested',
      resolutionMessage: 'I\'ve arranged a replacement for you. We\'ll pick up the damaged item and deliver a new one within 5-7 business days.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'refund',
      text: 'Return and get refund',
      nextStep: 'ESCALATE',
      escalationReason: 'Damaged product - Refund requested',
      resolutionMessage: 'I\'ve initiated a return and refund. We\'ll arrange pickup within 24 hours. You\'ll receive a full refund within 5-7 business days.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Did Not Get Item Menu
 */
export const DID_NOT_GET_ITEM_MENU: ChatStep = {
  id: 'did_not_get_item_menu',
  message: 'I\'m sorry you haven\'t received your item. Let me help you track it down.',
  options: [
    {
      id: 'check_neighbors',
      text: 'It might be with neighbors',
      nextStep: 'check_neighbors_flow'
    },
    {
      id: 'wrong_address',
      text: 'Delivered to wrong address',
      nextStep: 'ESCALATE',
      escalationReason: 'Package delivered to wrong address',
      resolutionMessage: 'I\'ve escalated this to our logistics team. They\'ll investigate with the delivery partner and contact you within 24 hours. If not found, we\'ll send a replacement or refund.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'never_arrived',
      text: 'Package never arrived',
      nextStep: 'ESCALATE',
      escalationReason: 'Package not received - Investigation needed',
      resolutionMessage: 'I\'ve initiated an investigation with our delivery partner. We\'ll locate your package or arrange a replacement/refund within 48 hours.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Check Neighbors Flow
 */
export const CHECK_NEIGHBORS_FLOW: ChatStep = {
  id: 'check_neighbors_flow',
  message: 'Have you checked with your neighbors or building security?',
  options: [
    {
      id: 'found_it',
      text: 'Yes, found it!',
      nextStep: 'RESOLVE',
      resolutionMessage: 'Great! I\'m glad you found your package. Enjoy your purchase! If you need anything else, feel free to contact us.'
    },
    {
      id: 'not_found',
      text: 'Checked, but not found',
      nextStep: 'ESCALATE',
      escalationReason: 'Package not found after checking neighbors',
      resolutionMessage: 'I\'ve escalated this to our logistics team for investigation. They\'ll contact you within 24 hours. We\'ll arrange a replacement or refund if the package isn\'t located.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Return/Exchange Menu
 */
export const RETURN_EXCHANGE_MENU: ChatStep = {
  id: 'return_exchange_menu',
  message: 'Would you like to return or exchange your item?',
  options: [
    {
      id: 'return_refund',
      text: 'Return for refund',
      nextStep: 'return_reason_menu'
    },
    {
      id: 'exchange_item',
      text: 'Exchange for different size/color',
      nextStep: 'exchange_flow'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Return Reason Menu
 */
export const RETURN_REASON_MENU: ChatStep = {
  id: 'return_reason_menu',
  message: 'What is the reason for return?',
  options: [
    {
      id: 'changed_mind',
      text: 'Changed my mind',
      nextStep: 'ESCALATE',
      escalationReason: 'Return - Changed mind',
      resolutionMessage: 'I\'ve initiated your return request. You can return the item within 30 days. We\'ll arrange pickup within 24 hours. Refund will be processed within 5-7 business days after we receive the item.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'not_as_expected',
      text: 'Product not as expected',
      nextStep: 'ESCALATE',
      escalationReason: 'Return - Product not as expected',
      resolutionMessage: 'I\'ve initiated your return request. We\'ll arrange pickup within 24 hours. You\'ll receive a full refund within 5-7 business days.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'quality_issue',
      text: 'Quality issue',
      nextStep: 'ESCALATE',
      escalationReason: 'Return - Quality issue',
      resolutionMessage: 'I apologize for the quality issue. I\'ve initiated a priority return. We\'ll arrange pickup within 24 hours and process your full refund within 3-5 business days.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Exchange Flow
 */
export const EXCHANGE_FLOW: ChatStep = {
  id: 'exchange_flow',
  message: 'I\'ll help you exchange your item.',
  options: [
    {
      id: 'different_size',
      text: 'Exchange for different size',
      nextStep: 'ESCALATE',
      escalationReason: 'Exchange - Different size',
      resolutionMessage: 'I\'ve initiated an exchange request. Our team will contact you within 24 hours to confirm the size and arrange pickup and delivery.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'different_color',
      text: 'Exchange for different color',
      nextStep: 'ESCALATE',
      escalationReason: 'Exchange - Different color',
      resolutionMessage: 'I\'ve initiated an exchange request. Our team will contact you within 24 hours to confirm availability and arrange pickup and delivery.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Feedback Menu
 */
export const FEEDBACK_MENU: ChatStep = {
  id: 'feedback_menu',
  message: 'Please share your feedback about the delivery executive:',
  options: [
    {
      id: 'positive_feedback',
      text: 'Positive feedback',
      nextStep: 'RESOLVE',
      resolutionMessage: 'Thank you for your positive feedback! We\'ll share this with our delivery partner. Your appreciation motivates our delivery executives!'
    },
    {
      id: 'negative_feedback',
      text: 'Negative feedback / Complaint',
      nextStep: 'ESCALATE',
      escalationReason: 'Negative feedback about delivery executive',
      resolutionMessage: 'Thank you for bringing this to our attention. I\'ve forwarded your feedback to our logistics team. They\'ll investigate and take appropriate action.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * Other Issue Menu
 */
export const OTHER_ISSUE_MENU: ChatStep = {
  id: 'other_issue_menu',
  message: 'Please select the type of issue:',
  options: [
    {
      id: 'payment_issue',
      text: 'Payment or billing issue',
      nextStep: 'ESCALATE',
      escalationReason: 'Payment/billing issue',
      resolutionMessage: 'I\'ve escalated your payment issue to our billing team. They\'ll review and contact you within 24 hours.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'account_issue',
      text: 'Account related issue',
      nextStep: 'ESCALATE',
      escalationReason: 'Account issue',
      resolutionMessage: 'I\'ve forwarded your account issue to our support team. They\'ll assist you within 24 hours.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'general_query',
      text: 'General query',
      nextStep: 'ESCALATE',
      escalationReason: 'General query',
      resolutionMessage: 'I\'ve created a ticket for your query. Our support team will contact you within 24 hours.\n\nTicket #TKT-{timestamp} has been created.'
    },
    {
      id: 'back_to_main',
      text: 'Back to main menu',
      nextStep: 'main_menu'
    }
  ]
};

/**
 * All Chat Steps Map
 */
export const CHAT_STEPS: Record<string, ChatStep> = {
  'main_menu': MAIN_MENU,
  'issue_with_item_menu': ISSUE_WITH_ITEM_MENU,
  'wrong_product_flow': WRONG_PRODUCT_FLOW,
  'image_mismatch_flow': IMAGE_MISMATCH_FLOW,
  'missing_item_flow': MISSING_ITEM_FLOW,
  'damaged_product_flow': DAMAGED_PRODUCT_FLOW,
  'did_not_get_item_menu': DID_NOT_GET_ITEM_MENU,
  'check_neighbors_flow': CHECK_NEIGHBORS_FLOW,
  'return_exchange_menu': RETURN_EXCHANGE_MENU,
  'return_reason_menu': RETURN_REASON_MENU,
  'exchange_flow': EXCHANGE_FLOW,
  'feedback_menu': FEEDBACK_MENU,
  'other_issue_menu': OTHER_ISSUE_MENU
};

/**
 * Get Chat Step
 * 
 * @param stepId - Step ID
 * @returns Chat step
 */
export function getChatStep(stepId: string): ChatStep | undefined {
  return CHAT_STEPS[stepId];
}
