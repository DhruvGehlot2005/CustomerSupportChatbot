/**
 * Conversation Service
 * 
 * Purpose: Manage conversation flow and question navigation.
 * 
 * Responsibilities:
 * - Navigate through question trees
 * - Determine next question based on answers
 * - Validate user answers
 * - Decide when to move to resolution
 * 
 * Design Principle:
 * All logic is deterministic and rule-based. No AI decision-making.
 * Question flow is predetermined by question trees.
 * 
 * Integration Points:
 * - Uses question trees for navigation
 * - Uses session service for state management
 * - Used by API endpoints
 */

import { 
  Question, 
  IssueCategory, 
  ConversationSession,
  ValidationRule 
} from '../types';
import { 
  getQuestion, 
  getNextQuestionId, 
  getQuestionTree 
} from '../config/questionTrees';
import { VALIDATION_CONFIG } from '../config/constants';

/**
 * Get First Question
 * 
 * Gets the first question for a given category.
 * This is the entry point into the question tree.
 * 
 * @param category - Issue category
 * @returns First question in the tree
 */
export function getFirstQuestion(category: IssueCategory): Question {
  const tree = getQuestionTree(category);
  const question = getQuestion(category, tree.rootQuestionId);
  
  if (!question) {
    throw new Error(`Root question not found for category ${category}`);
  }
  
  console.log(`[ConversationService] Starting question tree for ${category}`);
  
  return question;
}

/**
 * Get Next Question
 * 
 * Determines the next question based on current question and user's answer.
 * This is pure deterministic logic - no AI involved.
 * 
 * @param category - Issue category
 * @param currentQuestionId - Current question ID
 * @param answer - User's answer
 * @returns Next question, or undefined if at end of tree
 */
export function getNextQuestion(
  category: IssueCategory,
  currentQuestionId: string,
  answer: string
): Question | undefined {
  // Get next question ID based on answer
  const nextQuestionId = getNextQuestionId(category, currentQuestionId, answer);
  
  if (!nextQuestionId) {
    console.log(
      `[ConversationService] End of question tree reached for ${category}`
    );
    return undefined;
  }
  
  // Get the actual question
  const nextQuestion = getQuestion(category, nextQuestionId);
  
  if (!nextQuestion) {
    console.error(
      `[ConversationService] Question ${nextQuestionId} not found in ${category} tree`
    );
    return undefined;
  }
  
  console.log(
    `[ConversationService] Next question: ${nextQuestionId} for ${category}`
  );
  
  return nextQuestion;
}

/**
 * Validate Answer
 * 
 * Validates a user's answer against the question's validation rules.
 * 
 * @param question - The question being answered
 * @param answer - User's answer
 * @returns Validation result with success flag and error message
 */
export function validateAnswer(
  question: Question,
  answer: string
): { valid: boolean; error?: string } {
  // Check if answer is empty
  if (!answer || answer.trim().length === 0) {
    return {
      valid: false,
      error: 'Answer cannot be empty'
    };
  }
  
  // Check maximum length
  if (answer.length > VALIDATION_CONFIG.MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Answer is too long (maximum ${VALIDATION_CONFIG.MAX_TEXT_LENGTH} characters)`
    };
  }
  
  // If no validation rules, answer is valid
  if (!question.validationRules || question.validationRules.length === 0) {
    return { valid: true };
  }
  
  // Check each validation rule
  for (const rule of question.validationRules) {
    const result = validateRule(rule, answer);
    if (!result.valid) {
      return result;
    }
  }
  
  return { valid: true };
}

/**
 * Validate Rule
 * 
 * Validates an answer against a specific validation rule.
 * 
 * @param rule - Validation rule
 * @param answer - User's answer
 * @returns Validation result
 */
function validateRule(
  rule: ValidationRule,
  answer: string
): { valid: boolean; error?: string } {
  switch (rule.type) {
    case 'required':
      if (!answer || answer.trim().length === 0) {
        return {
          valid: false,
          error: rule.errorMessage
        };
      }
      break;
      
    case 'pattern':
      if (typeof rule.value === 'string') {
        const regex = new RegExp(rule.value);
        if (!regex.test(answer)) {
          return {
            valid: false,
            error: rule.errorMessage
          };
        }
      }
      break;
      
    case 'minLength':
      if (typeof rule.value === 'number' && answer.length < rule.value) {
        return {
          valid: false,
          error: rule.errorMessage
        };
      }
      break;
      
    case 'maxLength':
      if (typeof rule.value === 'number' && answer.length > rule.value) {
        return {
          valid: false,
          error: rule.errorMessage
        };
      }
      break;
      
    case 'custom':
      // Custom validation logic can be added here
      break;
  }
  
  return { valid: true };
}

/**
 * Should Proceed to Resolution
 * 
 * Determines if enough information has been collected to proceed to resolution.
 * 
 * Logic:
 * - If we've reached the end of the question tree (no next question)
 * - If we have all required data for resolution
 * 
 * @param session - Current conversation session
 * @param currentQuestion - Current question
 * @param answer - User's latest answer
 * @returns True if should proceed to resolution
 */
export function shouldProceedToResolution(
  session: ConversationSession,
  currentQuestion: Question,
  answer: string
): boolean {
  if (!session.category) {
    return false;
  }
  
  // Check if there's a next question
  const nextQuestionId = getNextQuestionId(
    session.category,
    currentQuestion.id,
    answer
  );
  
  // If no next question, we're at the end of the tree
  if (!nextQuestionId) {
    console.log('[ConversationService] End of question tree - proceeding to resolution');
    return true;
  }
  
  // Could add additional logic here to check if we have enough data
  // For now, we follow the tree to completion
  
  return false;
}

/**
 * Get Question Progress
 * 
 * Calculates how far through the question tree the user has progressed.
 * Useful for showing progress indicators in the UI.
 * 
 * @param category - Issue category
 * @param answeredQuestions - Number of questions answered
 * @returns Progress information
 */
export function getQuestionProgress(
  category: IssueCategory,
  answeredQuestions: number
): { current: number; total: number; percentage: number } {
  const tree = getQuestionTree(category);
  const totalQuestions = Object.keys(tree.questions).length;
  
  const percentage = totalQuestions > 0 
    ? Math.round((answeredQuestions / totalQuestions) * 100)
    : 0;
  
  return {
    current: answeredQuestions,
    total: totalQuestions,
    percentage
  };
}

/**
 * Format Question for Display
 * 
 * Formats a question for display to the user.
 * Adds any necessary context or instructions.
 * 
 * @param question - Question to format
 * @returns Formatted question text
 */
export function formatQuestionForDisplay(question: Question): string {
  let formatted = question.text;
  
  // Add instructions based on question type
  switch (question.type) {
    case 'SINGLE_CHOICE':
      if (question.options && question.options.length > 0) {
        formatted += '\n\nPlease select one of the following options:';
        question.options.forEach((option, index) => {
          formatted += `\n${index + 1}. ${option}`;
        });
      }
      break;
      
    case 'MULTIPLE_CHOICE':
      if (question.options && question.options.length > 0) {
        formatted += '\n\nYou can select multiple options (separate with commas):';
        question.options.forEach((option, index) => {
          formatted += `\n${index + 1}. ${option}`;
        });
      }
      break;
      
    case 'YES_NO':
      formatted += '\n\nPlease answer: Yes or No';
      break;
      
    case 'DATE':
      formatted += '\n\nPlease provide a date (e.g., 2025-12-25)';
      break;
      
    case 'ORDER_ID':
      formatted += '\n\nFormat: ORD-XXXXX (e.g., ORD-12345)';
      break;
      
    case 'TEXT_INPUT':
      // No additional instructions needed
      break;
  }
  
  return formatted;
}

/**
 * Parse User Answer
 * 
 * Parses and normalizes user's answer based on question type.
 * 
 * @param question - Question being answered
 * @param rawAnswer - Raw answer from user
 * @returns Normalized answer
 */
export function parseUserAnswer(question: Question, rawAnswer: string): string {
  const trimmed = rawAnswer.trim();
  
  switch (question.type) {
    case 'YES_NO':
      // Normalize yes/no answers
      const lower = trimmed.toLowerCase();
      if (lower === 'yes' || lower === 'y' || lower === 'true') {
        return 'yes';
      } else if (lower === 'no' || lower === 'n' || lower === 'false') {
        return 'no';
      }
      return trimmed;
      
    case 'SINGLE_CHOICE':
      // If user provided a number, convert to option text
      if (question.options && /^\d+$/.test(trimmed)) {
        const index = parseInt(trimmed, 10) - 1;
        if (index >= 0 && index < question.options.length) {
          return question.options[index];
        }
      }
      return trimmed;
      
    case 'ORDER_ID':
      // Normalize order ID format
      return trimmed.toUpperCase();
      
    default:
      return trimmed;
  }
}
