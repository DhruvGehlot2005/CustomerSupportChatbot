/**
 * Type Definitions
 * 
 * Purpose: Define TypeScript interfaces and types for the entire backend system
 * 
 * Structure:
 * - Issue categories and classification
 * - Question trees and conversation flow
 * - Resolution paths and outcomes
 * - Session management
 * 
 * Design Principle:
 * All types are strictly defined to ensure type safety and prevent runtime errors.
 * These types enforce the constraint that all logic is predefined and deterministic.
 */

/**
 * Issue Categories
 * 
 * Predefined categories that the system can handle.
 * These are the ONLY categories the AI can classify issues into.
 * No new categories can be invented by the AI.
 */
export enum IssueCategory {
  ORDER_STATUS = 'ORDER_STATUS',
  DELIVERY_PROBLEM = 'DELIVERY_PROBLEM',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  REFUND_REQUEST = 'REFUND_REQUEST',
  PRODUCT_DEFECT = 'PRODUCT_DEFECT',
  ACCOUNT_ACCESS = 'ACCOUNT_ACCESS',
  BILLING_INQUIRY = 'BILLING_INQUIRY',
  CANCELLATION = 'CANCELLATION',
  OTHER = 'OTHER'
}

/**
 * Confidence Level
 * 
 * Represents how confident the system is about issue classification.
 * Used to determine if more clarifying questions are needed.
 */
export enum ConfidenceLevel {
  HIGH = 'HIGH',       // >= 0.8: Proceed with resolution
  MEDIUM = 'MEDIUM',   // 0.5-0.79: Ask 1-2 clarifying questions
  LOW = 'LOW'          // < 0.5: Ask multiple clarifying questions or escalate
}

/**
 * Question Type
 * 
 * Different types of questions the system can ask.
 * Each type has specific handling logic.
 */
export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',     // User selects one option
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', // User can select multiple options
  TEXT_INPUT = 'TEXT_INPUT',           // User provides free text
  YES_NO = 'YES_NO',                   // Simple yes/no question
  DATE = 'DATE',                       // Date input
  ORDER_ID = 'ORDER_ID'                // Specific order ID format
}

/**
 * Resolution Type
 * 
 * Possible outcomes of a support interaction.
 * All resolutions are predefined; AI cannot invent new ones.
 */
export enum ResolutionType {
  SELF_SERVICE = 'SELF_SERVICE',           // User can resolve themselves
  AUTOMATED_ACTION = 'AUTOMATED_ACTION',   // System performs action automatically
  ESCALATE_AGENT = 'ESCALATE_AGENT',       // Requires human agent
  ESCALATE_SPECIALIST = 'ESCALATE_SPECIALIST', // Requires specialist team
  INFORMATION_PROVIDED = 'INFORMATION_PROVIDED' // Question answered with info
}

/**
 * Conversation Mode
 * 
 * Two modes of interaction as specified in requirements.
 */
export enum ConversationMode {
  SYSTEM_INITIATED = 'SYSTEM_INITIATED', // Mode 1: Guided flow
  USER_INITIATED = 'USER_INITIATED'      // Mode 2: Free-text classification
}

/**
 * Question Definition
 * 
 * Represents a single question in the conversation tree.
 * Questions are predefined and selected based on previous answers.
 */
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For choice-based questions
  nextQuestionMap?: Record<string, string>; // Maps answer -> next question ID
  validationRules?: ValidationRule[];
}

/**
 * Validation Rule
 * 
 * Rules for validating user input.
 * Ensures data quality before processing.
 */
export interface ValidationRule {
  type: 'required' | 'pattern' | 'minLength' | 'maxLength' | 'custom';
  value?: string | number;
  errorMessage: string;
}

/**
 * Resolution Path
 * 
 * Defines how an issue should be resolved.
 * All paths are predefined; AI only helps generate the response text.
 */
export interface ResolutionPath {
  id: string;
  category: IssueCategory;
  type: ResolutionType;
  conditions: ResolutionCondition[]; // Conditions that must be met
  steps?: string[]; // Steps for self-service resolutions
  escalationReason?: string; // Why escalation is needed
  estimatedTime?: string; // Expected resolution time
  requiresData?: string[]; // What data is needed (order ID, etc.)
}

/**
 * Resolution Condition
 * 
 * Conditions that determine which resolution path to take.
 * Based on answers collected during conversation.
 */
export interface ResolutionCondition {
  questionId: string;
  expectedAnswer: string | string[];
  operator: 'equals' | 'contains' | 'in' | 'greaterThan' | 'lessThan';
}

/**
 * Issue Classification Result
 * 
 * Result of classifying user's free-text input.
 * Includes confidence score to determine next steps.
 */
export interface ClassificationResult {
  category: IssueCategory;
  confidence: number; // 0-1 scale
  confidenceLevel: ConfidenceLevel;
  reasoning?: string; // For debugging/logging only
  suggestedQuestions?: string[]; // Question IDs to ask next
}

/**
 * Conversation Session
 * 
 * Tracks the state of an ongoing conversation.
 * Stored in-memory on the backend.
 */
export interface ConversationSession {
  sessionId: string;
  mode: ConversationMode;
  category?: IssueCategory;
  confidence?: number;
  answers: Record<string, string>; // questionId -> answer
  currentQuestionId?: string;
  conversationHistory: Message[];
  createdAt: Date;
  updatedAt: Date;
  resolved: boolean;
  resolution?: Resolution;
}

/**
 * Message
 * 
 * Represents a single message in the conversation.
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Resolution
 * 
 * Final resolution provided to the user.
 */
export interface Resolution {
  type: ResolutionType;
  message: string;
  steps?: string[];
  escalationDetails?: EscalationDetails;
  referenceNumber?: string;
}

/**
 * Escalation Details
 * 
 * Information about escalated cases.
 */
export interface EscalationDetails {
  team: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedResponseTime: string;
  ticketNumber: string;
}

/**
 * API Request/Response Types
 */

/**
 * Start Conversation Request
 * 
 * Initiates a new conversation session.
 */
export interface StartConversationRequest {
  mode: ConversationMode;
  initialMessage?: string; // For user-initiated mode
}

/**
 * Start Conversation Response
 * 
 * Returns session ID and initial message.
 */
export interface StartConversationResponse {
  sessionId: string;
  message: string;
  question?: Question;
}

/**
 * Send Message Request
 * 
 * User sends a message or answer.
 */
export interface SendMessageRequest {
  sessionId: string;
  message: string;
  questionId?: string; // If answering a specific question
}

/**
 * Send Message Response
 * 
 * System's response to user message.
 */
export interface SendMessageResponse {
  message: string;
  question?: Question;
  resolution?: Resolution;
  requiresEscalation?: boolean;
}

/**
 * Gemini API Types
 */

/**
 * Gemini Classification Request
 * 
 * Request to Gemini for classifying user input.
 * Strictly constrained to return only predefined categories.
 */
export interface GeminiClassificationRequest {
  userMessage: string;
  conversationHistory: Message[];
  allowedCategories: IssueCategory[];
}

/**
 * Gemini Classification Response
 * 
 * Gemini's classification result.
 * Must conform to predefined categories only.
 */
export interface GeminiClassificationResponse {
  category: IssueCategory;
  confidence: number;
  reasoning: string;
}

/**
 * Gemini Response Generation Request
 * 
 * Request to Gemini for generating natural language response.
 * Gemini only generates the text; logic is predetermined.
 */
export interface GeminiResponseRequest {
  template: string; // Predefined template with placeholders
  context: Record<string, string>; // Data to fill template
  tone: 'professional' | 'friendly' | 'apologetic' | 'informative';
}
