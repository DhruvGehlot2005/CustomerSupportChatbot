/**
 * Resolution Service
 * 
 * Purpose: Determine and provide resolutions for customer issues.
 * 
 * Responsibilities:
 * - Find matching resolution path based on collected answers
 * - Generate resolution details
 * - Create escalation tickets when needed
 * 
 * Design Principle:
 * All resolution paths are predefined. This service only matches
 * the collected data to the appropriate path. No AI decision-making.
 * 
 * Integration Points:
 * - Uses resolution paths configuration
 * - Uses response generation service for natural language
 * - Used by conversation service
 */

import { 
  Resolution, 
  ResolutionType, 
  IssueCategory,
  EscalationDetails 
} from '../types';
import { findMatchingResolution } from '../config/resolutionPaths';
import { v4 as uuidv4 } from 'uuid';

/**
 * Find Resolution
 * 
 * Finds the appropriate resolution based on category and collected answers.
 * This is pure deterministic logic - matches conditions to paths.
 * 
 * @param category - Issue category
 * @param answers - Collected answers from conversation
 * @returns Resolution object
 */
export function findResolution(
  category: IssueCategory,
  answers: Record<string, string>
): Resolution {
  console.log(`[ResolutionService] Finding resolution for ${category}`);
  
  // Find matching resolution path
  const path = findMatchingResolution(category, answers);
  
  if (!path) {
    console.error(`[ResolutionService] No resolution path found for ${category}`);
    // Fallback to escalation
    return createEscalationResolution(
      'No matching resolution path found',
      'medium',
      '24-48 hours'
    );
  }
  
  console.log(`[ResolutionService] Matched resolution path: ${path.id}`);
  
  // Build resolution based on path type
  switch (path.type) {
    case ResolutionType.SELF_SERVICE:
      return createSelfServiceResolution(path.steps || []);
      
    case ResolutionType.AUTOMATED_ACTION:
      return createAutomatedActionResolution(
        path.steps || [],
        path.estimatedTime || 'Processing'
      );
      
    case ResolutionType.INFORMATION_PROVIDED:
      return createInformationResolution(
        path.steps || [],
        answers
      );
      
    case ResolutionType.ESCALATE_AGENT:
      return createEscalationResolution(
        path.escalationReason || 'Requires agent assistance',
        'medium',
        path.estimatedTime || '24 hours'
      );
      
    case ResolutionType.ESCALATE_SPECIALIST:
      return createEscalationResolution(
        path.escalationReason || 'Requires specialist team',
        'high',
        path.estimatedTime || '48 hours'
      );
      
    default:
      return createEscalationResolution(
        'Unknown resolution type',
        'medium',
        '24 hours'
      );
  }
}

/**
 * Create Self-Service Resolution
 * 
 * Creates a resolution where the user can resolve the issue themselves.
 * 
 * @param steps - Steps for the user to follow
 * @returns Self-service resolution
 */
function createSelfServiceResolution(steps: string[]): Resolution {
  return {
    type: ResolutionType.SELF_SERVICE,
    message: 'You can resolve this issue yourself by following these steps:',
    steps
  };
}

/**
 * Create Automated Action Resolution
 * 
 * Creates a resolution where the system performs an action automatically.
 * 
 * @param steps - What will happen automatically
 * @param estimatedTime - When it will be completed
 * @returns Automated action resolution
 */
function createAutomatedActionResolution(
  steps: string[],
  _estimatedTime: string
): Resolution {
  return {
    type: ResolutionType.AUTOMATED_ACTION,
    message: `I'll take care of this for you. Here's what will happen:`,
    steps,
    referenceNumber: generateReferenceNumber()
  };
}

/**
 * Create Information Resolution
 * 
 * Creates a resolution that provides information to the user.
 * 
 * @param info - Information to provide
 * @param answers - User's answers (may contain data to include)
 * @returns Information resolution
 */
function createInformationResolution(
  info: string[],
  _answers: Record<string, string>
): Resolution {
  // Could enhance this to look up actual order data, etc.
  // For now, just provide the predefined information
  
  return {
    type: ResolutionType.INFORMATION_PROVIDED,
    message: 'Here\'s the information you need:',
    steps: info
  };
}

/**
 * Create Escalation Resolution
 * 
 * Creates a resolution that escalates to a human agent or specialist.
 * 
 * @param reason - Why escalation is needed
 * @param priority - Priority level
 * @param estimatedTime - Expected response time
 * @returns Escalation resolution
 */
function createEscalationResolution(
  _reason: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  estimatedTime: string
): Resolution {
  const ticketNumber = generateTicketNumber();
  
  const escalationDetails: EscalationDetails = {
    team: getTeamForPriority(priority),
    priority,
    estimatedResponseTime: estimatedTime,
    ticketNumber
  };
  
  return {
    type: priority === 'high' || priority === 'urgent' 
      ? ResolutionType.ESCALATE_SPECIALIST 
      : ResolutionType.ESCALATE_AGENT,
    message: `I've created a support ticket for you. Our team will help resolve this issue.`,
    escalationDetails,
    referenceNumber: ticketNumber
  };
}

/**
 * Generate Ticket Number
 * 
 * Generates a unique ticket number for escalations.
 * Format: TKT-YYYYMMDD-XXXX
 * 
 * @returns Ticket number
 */
function generateTicketNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `TKT-${dateStr}-${random}`;
}

/**
 * Generate Reference Number
 * 
 * Generates a unique reference number for automated actions.
 * Format: REF-XXXXXXXX
 * 
 * @returns Reference number
 */
function generateReferenceNumber(): string {
  const uuid = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `REF-${uuid}`;
}

/**
 * Get Team for Priority
 * 
 * Determines which team should handle an escalation based on priority.
 * 
 * @param priority - Priority level
 * @returns Team name
 */
function getTeamForPriority(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'Priority Support Team';
    case 'high':
      return 'Specialist Team';
    case 'medium':
      return 'Customer Support Team';
    case 'low':
      return 'General Support Team';
    default:
      return 'Customer Support Team';
  }
}

/**
 * Format Resolution for Display
 * 
 * Formats a resolution object into a user-friendly message.
 * This is a template that will be enhanced by Gemini for natural language.
 * 
 * @param resolution - Resolution object
 * @returns Formatted message
 */
export function formatResolutionForDisplay(resolution: Resolution): string {
  let message = resolution.message + '\n\n';
  
  // Add steps if present
  if (resolution.steps && resolution.steps.length > 0) {
    resolution.steps.forEach((step, index) => {
      message += `${index + 1}. ${step}\n`;
    });
    message += '\n';
  }
  
  // Add escalation details if present
  if (resolution.escalationDetails) {
    const details = resolution.escalationDetails;
    message += `Ticket Number: ${details.ticketNumber}\n`;
    message += `Team: ${details.team}\n`;
    message += `Priority: ${details.priority.toUpperCase()}\n`;
    message += `Estimated Response Time: ${details.estimatedResponseTime}\n\n`;
    message += 'You will receive an email confirmation shortly.\n';
  }
  
  // Add reference number if present
  if (resolution.referenceNumber && !resolution.escalationDetails) {
    message += `Reference Number: ${resolution.referenceNumber}\n`;
  }
  
  return message.trim();
}

/**
 * Validate Resolution
 * 
 * Validates that a resolution object is properly formed.
 * 
 * @param resolution - Resolution to validate
 * @returns True if valid
 */
export function validateResolution(resolution: Resolution): boolean {
  // Check required fields
  if (!resolution.type || !resolution.message) {
    console.error('[ResolutionService] Resolution missing required fields');
    return false;
  }
  
  // Check type-specific requirements
  switch (resolution.type) {
    case ResolutionType.SELF_SERVICE:
    case ResolutionType.AUTOMATED_ACTION:
      if (!resolution.steps || resolution.steps.length === 0) {
        console.error('[ResolutionService] Self-service/automated resolution missing steps');
        return false;
      }
      break;
      
    case ResolutionType.ESCALATE_AGENT:
    case ResolutionType.ESCALATE_SPECIALIST:
      if (!resolution.escalationDetails) {
        console.error('[ResolutionService] Escalation resolution missing details');
        return false;
      }
      break;
  }
  
  return true;
}
