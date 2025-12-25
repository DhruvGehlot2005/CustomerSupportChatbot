/**
 * System Constants and Configuration
 * 
 * Purpose: Define system-wide constants, thresholds, and configuration values.
 * 
 * Design Principle:
 * All magic numbers and configuration values are centralized here.
 * This makes the system easy to tune and maintain.
 * 
 * Integration Points:
 * - Used by classification service for confidence thresholds
 * - Used by conversation service for flow control
 * - Referenced throughout the backend for consistent behavior
 */

import { ConfidenceLevel } from '../types';

/**
 * Confidence Thresholds
 * 
 * Thresholds for determining confidence levels in issue classification.
 * These control when the system asks clarifying questions vs proceeding with resolution.
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,    // >= 0.8: High confidence, proceed with resolution
  MEDIUM: 0.5,  // 0.5-0.79: Medium confidence, ask 1-2 clarifying questions
  LOW: 0.5      // < 0.5: Low confidence, ask multiple questions or escalate
} as const;

/**
 * Get Confidence Level
 * 
 * Converts a numeric confidence score to a confidence level enum.
 * 
 * @param confidence - Confidence score (0-1)
 * @returns Confidence level enum
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
    return ConfidenceLevel.HIGH;
  } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return ConfidenceLevel.MEDIUM;
  } else {
    return ConfidenceLevel.LOW;
  }
}

/**
 * Session Configuration
 * 
 * Configuration for conversation session management.
 */
export const SESSION_CONFIG = {
  // Session timeout in milliseconds (30 minutes)
  TIMEOUT_MS: 30 * 60 * 1000,
  
  // Maximum number of messages per session
  MAX_MESSAGES: 100,
  
  // Maximum number of active sessions
  MAX_ACTIVE_SESSIONS: 1000
} as const;

/**
 * Gemini API Configuration
 * 
 * Configuration for Gemini API calls.
 */
export const GEMINI_CONFIG = {
  // Model to use
  MODEL: 'gemini-1.5-flash',
  
  // Temperature for classification (lower = more deterministic)
  CLASSIFICATION_TEMPERATURE: 0.1,
  
  // Temperature for response generation (slightly higher for natural language)
  RESPONSE_TEMPERATURE: 0.3,
  
  // Maximum tokens for classification
  CLASSIFICATION_MAX_TOKENS: 100,
  
  // Maximum tokens for response generation
  RESPONSE_MAX_TOKENS: 500,
  
  // Request timeout in milliseconds
  TIMEOUT_MS: 10000
} as const;

/**
 * Validation Configuration
 * 
 * Configuration for input validation.
 */
export const VALIDATION_CONFIG = {
  // Maximum length for text input
  MAX_TEXT_LENGTH: 1000,
  
  // Minimum length for detailed descriptions
  MIN_DESCRIPTION_LENGTH: 10,
  
  // Order ID pattern
  ORDER_ID_PATTERN: /^ORD-[0-9]{5}$/,
  
  // Email pattern
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

/**
 * System-Initiated Flow Steps
 * 
 * Predefined steps for Mode 1 (System-Initiated) conversation flow.
 * This is the universal issue-resolution flow that guides users step by step.
 */
export const SYSTEM_INITIATED_FLOW = {
  // Welcome message
  WELCOME: 'Hello! I\'m here to help you with any issues you\'re experiencing. Let\'s work through this together.',
  
  // Main category selection
  MAIN_CATEGORIES: [
    {
      id: 'orders',
      label: 'Orders & Delivery',
      description: 'Track orders, delivery issues, or shipping questions',
      subcategories: ['ORDER_STATUS', 'DELIVERY_PROBLEM', 'CANCELLATION']
    },
    {
      id: 'payments',
      label: 'Payments & Refunds',
      description: 'Payment issues, refunds, or billing questions',
      subcategories: ['PAYMENT_ISSUE', 'REFUND_REQUEST', 'BILLING_INQUIRY']
    },
    {
      id: 'products',
      label: 'Products & Quality',
      description: 'Product defects, wrong items, or quality concerns',
      subcategories: ['PRODUCT_DEFECT']
    },
    {
      id: 'account',
      label: 'Account & Access',
      description: 'Login issues, password reset, or account problems',
      subcategories: ['ACCOUNT_ACCESS']
    },
    {
      id: 'other',
      label: 'Something Else',
      description: 'Other questions or issues',
      subcategories: ['OTHER']
    }
  ],
  
  // Follow-up prompts
  PROMPTS: {
    NEED_MORE_INFO: 'I need a bit more information to help you better.',
    CLARIFICATION: 'Just to make sure I understand correctly...',
    ALMOST_THERE: 'Great! Just one more thing...',
    PROCESSING: 'Let me look into that for you.',
    RESOLVED: 'I hope that helps! Is there anything else I can assist you with?',
    ESCALATED: 'I\'ve created a support ticket for you. Our team will reach out shortly.'
  }
} as const;

/**
 * Response Templates
 * 
 * Templates for generating consistent responses.
 * Gemini fills these templates with appropriate natural language.
 */
export const RESPONSE_TEMPLATES = {
  GREETING: {
    SYSTEM_INITIATED: 'Hello! I\'m your ShopEase support assistant. I\'m here to help resolve any issues you might have. What brings you here today?',
    USER_INITIATED: 'Hello! I understand you\'re experiencing an issue. I\'m here to help. Could you tell me more about what\'s happening?'
  },
  
  CLASSIFICATION_CONFIRMATION: 'It sounds like you\'re having an issue with {category}. Is that correct?',
  
  QUESTION_PROMPT: 'To help you better, I need to ask: {question}',
  
  RESOLUTION_INTRO: {
    SELF_SERVICE: 'Good news! You can resolve this yourself. Here\'s what you need to do:',
    AUTOMATED_ACTION: 'I can help you with that right away. Here\'s what will happen:',
    INFORMATION_PROVIDED: 'Here\'s the information you need:',
    ESCALATE_AGENT: 'I\'ll need to connect you with one of our support agents who can help you better.',
    ESCALATE_SPECIALIST: 'This requires our specialist team. I\'m creating a priority ticket for you.'
  },
  
  ESCALATION_MESSAGE: 'I\'ve created ticket #{ticketNumber} for you. Our {team} team will contact you within {estimatedTime}. You\'ll receive an email confirmation shortly.',
  
  APOLOGY: {
    DELAY: 'I apologize for the delay you\'re experiencing.',
    INCONVENIENCE: 'I\'m sorry for the inconvenience this has caused.',
    ISSUE: 'I understand how frustrating this must be.'
  },
  
  CLOSING: {
    RESOLVED: 'Is there anything else I can help you with today?',
    ESCALATED: 'Our team will take it from here. Is there anything else I can assist you with in the meantime?',
    GOODBYE: 'Thank you for contacting ShopEase support. Have a great day!'
  }
} as const;

/**
 * Error Messages
 * 
 * User-friendly error messages for various scenarios.
 */
export const ERROR_MESSAGES = {
  SESSION_NOT_FOUND: 'I\'m sorry, but I couldn\'t find your conversation. Please start a new chat.',
  SESSION_EXPIRED: 'Your session has expired. Please start a new conversation.',
  INVALID_INPUT: 'I didn\'t quite understand that. Could you please rephrase?',
  VALIDATION_FAILED: 'The information provided doesn\'t seem to be in the correct format. Please try again.',
  API_ERROR: 'I\'m experiencing technical difficulties. Please try again in a moment.',
  RATE_LIMIT: 'We\'re receiving a high volume of requests. Please wait a moment and try again.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again or contact support if the issue persists.'
} as const;

/**
 * Logging Configuration
 * 
 * Configuration for structured logging.
 */
export const LOGGING_CONFIG = {
  // Log levels
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },
  
  // What to log
  LOG_REQUESTS: true,
  LOG_RESPONSES: true,
  LOG_ERRORS: true,
  LOG_CLASSIFICATIONS: true,
  LOG_RESOLUTIONS: true,
  
  // Sensitive data to redact
  REDACT_FIELDS: ['password', 'apiKey', 'token', 'creditCard']
} as const;

/**
 * Rate Limiting Configuration
 * 
 * Configuration for API rate limiting.
 */
export const RATE_LIMIT_CONFIG = {
  // Maximum requests per window
  MAX_REQUESTS: 100,
  
  // Time window in milliseconds (1 minute)
  WINDOW_MS: 60 * 1000,
  
  // Message when rate limit exceeded
  MESSAGE: 'Too many requests. Please try again later.'
} as const;

/**
 * Feature Flags
 * 
 * Toggle features on/off for testing or gradual rollout.
 */
export const FEATURE_FLAGS = {
  // Enable Gemini API integration
  ENABLE_GEMINI: true,
  
  // Enable detailed logging
  ENABLE_DEBUG_LOGGING: true,
  
  // Enable session persistence (for future database integration)
  ENABLE_SESSION_PERSISTENCE: false,
  
  // Enable analytics tracking
  ENABLE_ANALYTICS: false
} as const;
