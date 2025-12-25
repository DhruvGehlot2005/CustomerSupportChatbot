/**
 * Classification Service
 * 
 * Purpose: Classify user issues into predefined categories.
 * 
 * Responsibilities:
 * - Use Gemini to classify free-text input
 * - Determine confidence level
 * - Suggest follow-up questions based on confidence
 * 
 * Design Principle:
 * This service uses Gemini for NLU but all decision logic is deterministic.
 * Gemini only translates natural language to structured categories.
 * 
 * Integration Points:
 * - Uses geminiService for AI classification
 * - Uses constants for confidence thresholds
 * - Used by conversation service
 */

import { IssueCategory, ClassificationResult, Message } from '../types';
import { classifyUserInput } from './geminiService';
import { getConfidenceLevel } from '../config/constants';
import { getQuestionTree } from '../config/questionTrees';

/**
 * Classify Issue
 * 
 * Classifies a user's issue based on their message and conversation history.
 * Uses Gemini for natural language understanding.
 * 
 * @param userMessage - User's message describing their issue
 * @param conversationHistory - Previous messages for context
 * @returns Classification result with category, confidence, and suggested questions
 */
export async function classifyIssue(
  userMessage: string,
  conversationHistory: Message[]
): Promise<ClassificationResult> {
  console.log('[ClassificationService] Classifying user input');
  
  // Use Gemini to classify the input
  const { category, confidence, reasoning } = await classifyUserInput(
    userMessage,
    conversationHistory
  );
  
  // Determine confidence level based on thresholds
  const confidenceLevel = getConfidenceLevel(confidence);
  
  // Get suggested questions based on confidence and category
  const suggestedQuestions = getSuggestedQuestions(category, confidenceLevel);
  
  const result: ClassificationResult = {
    category,
    confidence,
    confidenceLevel,
    reasoning,
    suggestedQuestions
  };
  
  console.log(
    `[ClassificationService] Classified as ${category} ` +
    `(confidence: ${confidence.toFixed(2)}, level: ${confidenceLevel})`
  );
  
  return result;
}

/**
 * Get Suggested Questions
 * 
 * Determines which questions to ask based on category and confidence level.
 * 
 * Logic:
 * - HIGH confidence: Start with root question of category tree
 * - MEDIUM confidence: Ask confirmation + root question
 * - LOW confidence: Ask for more details before proceeding
 * 
 * @param category - Classified category
 * @param confidenceLevel - Confidence level
 * @returns Array of question IDs to ask
 */
function getSuggestedQuestions(
  category: IssueCategory,
  confidenceLevel: string
): string[] {
  const questionTree = getQuestionTree(category);
  
  switch (confidenceLevel) {
    case 'HIGH':
      // High confidence: proceed directly to first question
      return [questionTree.rootQuestionId];
      
    case 'MEDIUM':
      // Medium confidence: ask for confirmation first
      return ['confirm_category', questionTree.rootQuestionId];
      
    case 'LOW':
      // Low confidence: ask for more details
      return ['clarify_issue'];
      
    default:
      return [questionTree.rootQuestionId];
  }
}

/**
 * Validate Classification
 * 
 * Validates that a classification result is valid.
 * Ensures category exists and confidence is in valid range.
 * 
 * @param result - Classification result to validate
 * @returns True if valid, false otherwise
 */
export function validateClassification(result: ClassificationResult): boolean {
  // Check category is valid
  if (!Object.values(IssueCategory).includes(result.category)) {
    console.error('[ClassificationService] Invalid category:', result.category);
    return false;
  }
  
  // Check confidence is in valid range
  if (result.confidence < 0 || result.confidence > 1) {
    console.error('[ClassificationService] Invalid confidence:', result.confidence);
    return false;
  }
  
  return true;
}

/**
 * Reclassify Issue
 * 
 * Reclassifies an issue if the initial classification was incorrect.
 * Used when user indicates the classification was wrong.
 * 
 * @param userMessage - User's clarification message
 * @param conversationHistory - Full conversation history
 * @param previousCategory - Previously classified category to avoid
 * @returns New classification result
 */
export async function reclassifyIssue(
  userMessage: string,
  conversationHistory: Message[],
  previousCategory: IssueCategory
): Promise<ClassificationResult> {
  console.log(
    `[ClassificationService] Reclassifying (previous: ${previousCategory})`
  );
  
  // Add context about previous incorrect classification
  const contextMessage: Message = {
    id: 'reclassify_context',
    role: 'system',
    content: `Previous classification as ${previousCategory} was incorrect. User is clarifying their issue.`,
    timestamp: new Date()
  };
  
  const historyWithContext = [...conversationHistory, contextMessage];
  
  // Classify again with additional context
  return classifyIssue(userMessage, historyWithContext);
}
