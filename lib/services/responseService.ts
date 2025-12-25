/**
 * Response Generation Service
 * 
 * Purpose: Generate natural language responses using templates and Gemini.
 * 
 * Responsibilities:
 * - Generate greeting messages
 * - Generate question prompts
 * - Generate resolution messages
 * - Generate error messages
 * 
 * Design Principle:
 * This service uses Gemini ONLY for natural language generation.
 * The content and structure are predetermined by templates.
 * Gemini just makes it sound natural and professional.
 * 
 * Integration Points:
 * - Uses geminiService for NLG
 * - Uses response templates from constants
 * - Used by API endpoints
 */

import { 
  Question, 
  Resolution, 
  ConversationMode,
  IssueCategory 
} from '../types';
import { generateResponse } from './geminiService';
import { RESPONSE_TEMPLATES } from '../config/constants';
import { getCategoryMetadata } from '../config/issueCategories';
import { formatResolutionForDisplay } from './resolutionService';

/**
 * Generate Greeting
 * 
 * Generates a greeting message based on conversation mode.
 * 
 * @param mode - Conversation mode
 * @returns Greeting message
 */
export async function generateGreeting(mode: ConversationMode): Promise<string> {
  const template = mode === ConversationMode.SYSTEM_INITIATED
    ? RESPONSE_TEMPLATES.GREETING.SYSTEM_INITIATED
    : RESPONSE_TEMPLATES.GREETING.USER_INITIATED;
  
  // For greetings, we can use the template directly or enhance with Gemini
  const response = await generateResponse(
    template,
    { mode },
    'friendly'
  );
  
  return response;
}

/**
 * Generate Classification Confirmation
 * 
 * Generates a message asking user to confirm the classified category.
 * Used when confidence is medium.
 * 
 * @param category - Classified category
 * @returns Confirmation message
 */
export async function generateClassificationConfirmation(
  category: IssueCategory
): Promise<string> {
  const metadata = getCategoryMetadata(category);
  
  const template = RESPONSE_TEMPLATES.CLASSIFICATION_CONFIRMATION;
  const context = {
    category: metadata.displayName,
    description: metadata.description
  };
  
  const response = await generateResponse(
    template,
    context,
    'friendly'
  );
  
  return response;
}

/**
 * Generate Question Prompt
 * 
 * Generates a natural language prompt for a question.
 * 
 * @param question - Question to ask
 * @param isFirstQuestion - Whether this is the first question
 * @returns Question prompt
 */
export async function generateQuestionPrompt(
  question: Question,
  isFirstQuestion: boolean = false
): Promise<string> {
  const intro = isFirstQuestion
    ? 'Let me ask you a few questions to help resolve this.'
    : 'Next question:';
  
  const template = `${intro}\n\n${question.text}`;
  
  // Add options if it's a choice question
  let fullTemplate = template;
  if (question.options && question.options.length > 0) {
    fullTemplate += '\n\nOptions:\n';
    question.options.forEach((option, index) => {
      fullTemplate += `${index + 1}. ${option}\n`;
    });
  }
  
  const response = await generateResponse(
    fullTemplate,
    { questionType: question.type },
    'professional'
  );
  
  return response;
}

/**
 * Generate Resolution Message
 * 
 * Generates a natural language resolution message.
 * 
 * @param resolution - Resolution object
 * @param category - Issue category
 * @returns Resolution message
 */
export async function generateResolutionMessage(
  resolution: Resolution,
  category: IssueCategory
): Promise<string> {
  // Get the appropriate intro template
  const introTemplate = RESPONSE_TEMPLATES.RESOLUTION_INTRO[resolution.type];
  
  // Format the resolution details
  const resolutionDetails = formatResolutionForDisplay(resolution);
  
  // Combine intro and details
  const fullTemplate = `${introTemplate}\n\n${resolutionDetails}`;
  
  // Determine tone based on resolution type
  const tone = resolution.type === ResolutionType.ESCALATE_AGENT ||
               resolution.type === ResolutionType.ESCALATE_SPECIALIST
    ? 'apologetic'
    : 'professional';
  
  const context = {
    category: getCategoryMetadata(category).displayName,
    resolutionType: resolution.type
  };
  
  const response = await generateResponse(
    fullTemplate,
    context,
    tone
  );
  
  return response;
}

/**
 * Generate Escalation Message
 * 
 * Generates a message for escalated cases.
 * 
 * @param ticketNumber - Ticket number
 * @param team - Team handling the escalation
 * @param estimatedTime - Estimated response time
 * @returns Escalation message
 */
export async function generateEscalationMessage(
  ticketNumber: string,
  team: string,
  estimatedTime: string
): Promise<string> {
  const template = RESPONSE_TEMPLATES.ESCALATION_MESSAGE;
  
  const context = {
    ticketNumber,
    team,
    estimatedTime
  };
  
  const response = await generateResponse(
    template,
    context,
    'apologetic'
  );
  
  return response;
}

/**
 * Generate Apology Message
 * 
 * Generates an appropriate apology based on the situation.
 * 
 * @param situation - Type of situation (delay, inconvenience, issue)
 * @returns Apology message
 */
export async function generateApology(
  situation: 'delay' | 'inconvenience' | 'issue'
): Promise<string> {
  const template = RESPONSE_TEMPLATES.APOLOGY[situation.toUpperCase() as keyof typeof RESPONSE_TEMPLATES.APOLOGY];
  
  const response = await generateResponse(
    template,
    { situation },
    'apologetic'
  );
  
  return response;
}

/**
 * Generate Closing Message
 * 
 * Generates a closing message based on resolution status.
 * 
 * @param resolved - Whether issue was resolved
 * @param escalated - Whether issue was escalated
 * @returns Closing message
 */
export async function generateClosing(
  resolved: boolean,
  escalated: boolean
): Promise<string> {
  let template: string;
  
  if (escalated) {
    template = RESPONSE_TEMPLATES.CLOSING.ESCALATED;
  } else if (resolved) {
    template = RESPONSE_TEMPLATES.CLOSING.RESOLVED;
  } else {
    template = RESPONSE_TEMPLATES.CLOSING.GOODBYE;
  }
  
  const response = await generateResponse(
    template,
    { resolved: resolved.toString(), escalated: escalated.toString() },
    'friendly'
  );
  
  return response;
}

/**
 * Generate Error Message
 * 
 * Generates a user-friendly error message.
 * 
 * @param errorType - Type of error
 * @param details - Additional details
 * @returns Error message
 */
export async function generateErrorMessage(
  errorType: string,
  details?: string
): Promise<string> {
  const template = `I apologize, but I encountered an issue: ${errorType}. ${details || 'Please try again.'}`;
  
  const response = await generateResponse(
    template,
    { errorType, details: details || '' },
    'apologetic'
  );
  
  return response;
}

/**
 * Generate Validation Error Message
 * 
 * Generates a message when user input fails validation.
 * 
 * @param validationError - Validation error message
 * @returns User-friendly error message
 */
export async function generateValidationError(
  validationError: string
): Promise<string> {
  const template = `I noticed an issue with your response: ${validationError}. Could you please try again?`;
  
  const response = await generateResponse(
    template,
    { error: validationError },
    'friendly'
  );
  
  return response;
}

/**
 * Generate Clarification Request
 * 
 * Generates a message asking for clarification when classification confidence is low.
 * 
 * @returns Clarification request message
 */
export async function generateClarificationRequest(): Promise<string> {
  const template = 'I want to make sure I understand your issue correctly. Could you provide a bit more detail about what\'s happening?';
  
  const response = await generateResponse(
    template,
    {},
    'friendly'
  );
  
  return response;
}

/**
 * Generate System-Initiated Category Options
 * 
 * Generates a message presenting category options for system-initiated mode.
 * 
 * @returns Category options message
 */
export async function generateCategoryOptions(): Promise<string> {
  const template = `I can help you with:

1. Orders & Delivery - Track orders, delivery issues, or shipping questions
2. Payments & Refunds - Payment issues, refunds, or billing questions
3. Products & Quality - Product defects, wrong items, or quality concerns
4. Account & Access - Login issues, password reset, or account problems
5. Something Else - Other questions or issues

Please select the number that best matches your issue, or describe your problem in your own words.`;
  
  const response = await generateResponse(
    template,
    {},
    'friendly'
  );
  
  return response;
}

// Import ResolutionType for type checking
import { ResolutionType } from '../types';
