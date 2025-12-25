/**
 * Intelligent Conversation Service
 * 
 * Purpose: Handle conversations using Gemini for more natural, adaptive interactions.
 * 
 * This service uses Gemini more extensively to:
 * - Generate contextual follow-up questions
 * - Provide intelligent responses
 * - Handle out-of-scope queries
 * - Determine when enough information is gathered
 * 
 * Design:
 * - Uses conversation history for context
 * - Generates dynamic questions based on user responses
 * - Provides helpful default responses
 * - Knows when to escalate or resolve
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, IssueCategory } from '../types';
import { GEMINI_CONFIG } from '../config/constants';

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Determine Next Action
 * 
 * Uses Gemini to determine what the assistant should do next.
 * 
 * @param conversationHistory - Full conversation history
 * @param category - Identified issue category
 * @param collectedInfo - Information already collected
 * @returns Next action with response
 */
export async function determineNextAction(
  conversationHistory: Message[],
  category?: IssueCategory,
  collectedInfo?: Record<string, any>
): Promise<{
  action: 'ask_question' | 'provide_solution' | 'escalate' | 'out_of_scope';
  response: string;
  needsInfo?: string[];
  reasoning?: string;
}> {
  if (!genAI) {
    return {
      action: 'ask_question',
      response: 'To assist you better, could you please provide your order number?',
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });
    
    const historyStr = conversationHistory
      .slice(-8) // Last 8 messages for better context
      .map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    const collectedStr = collectedInfo 
      ? Object.entries(collectedInfo)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      : 'None yet';
    
    const prompt = `You are analyzing a customer support conversation to determine the next action.

CONVERSATION HISTORY:
${historyStr}

IDENTIFIED CATEGORY: ${category || 'Not yet identified'}

INFORMATION ALREADY COLLECTED:
${collectedStr}

YOUR TASK:
Analyze the conversation and determine what to do next.

DECISION CRITERIA:

1. OUT_OF_SCOPE - Use if:
   - Customer asks about weather, politics, general knowledge
   - Topic is completely unrelated to e-commerce
   - Cannot be connected to shopping/orders/products

2. ASK_QUESTION - Use if:
   - Missing critical information (order number, email, product details)
   - Need clarification on the issue
   - Customer's problem is vague
   - Haven't gathered enough details to solve

3. PROVIDE_SOLUTION - Use if:
   - Have all necessary information
   - Can give specific steps or answer
   - Issue is clear and solvable
   - Customer asked a simple question with known answer

4. ESCALATE - Use if:
   - Issue is complex (multiple charges, account locked, legal matters)
   - Customer is frustrated or angry
   - Technical issue beyond basic support
   - Requires human judgment

INFORMATION TYPICALLY NEEDED:
- Order issues: Order number (ORD-XXXXX)
- Delivery problems: Order number + delivery address + timeline
- Refunds: Order number + reason + return status
- Product defects: Order number + defect description + photos (mention if needed)
- Account issues: Email address + specific problem
- Payment issues: Order number + payment method + amount

RESPOND IN THIS EXACT JSON FORMAT:
{
  "action": "ask_question" | "provide_solution" | "escalate" | "out_of_scope",
  "response": "Your professional response to the customer (2-4 sentences)",
  "needsInfo": ["specific", "information", "still", "needed"],
  "reasoning": "Brief explanation of your decision"
}

RESPONSE GUIDELINES:
- Be professional, empathetic, and helpful
- If asking for information, be specific about what you need and why
- If providing solution, give clear step-by-step instructions
- If escalating, explain why and what happens next
- Never repeat the same question if already answered
- Acknowledge information the customer has provided
- Use a warm, professional tone

Generate your analysis:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600,
      }
    });
    
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('[IntelligentConversation] Next action:', parsed.action, '-', parsed.reasoning);
      return {
        action: parsed.action,
        response: parsed.response,
        needsInfo: parsed.needsInfo,
        reasoning: parsed.reasoning
      };
    }
    
    return {
      action: 'ask_question',
      response: 'To help you effectively, could you please provide more details about your issue?',
    };
    
  } catch (error) {
    console.error('[IntelligentConversation] Error determining next action:', error);
    return {
      action: 'ask_question',
      response: 'I want to help you resolve this. Could you please share more details about what happened?',
    };
  }
}

/**
 * Generate Follow-Up Question
 * 
 * Generates a specific follow-up question based on conversation context.
 * 
 * @param conversationHistory - Conversation history
 * @param category - Issue category
 * @param neededInfo - What information is needed
 * @returns Follow-up question
 */
export async function generateFollowUpQuestion(
  conversationHistory: Message[],
  category: IssueCategory,
  neededInfo: string[]
): Promise<string> {
  if (!genAI) {
    return `To help you better, I need: ${neededInfo.join(', ')}. Could you provide this information?`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });
    
    const historyStr = conversationHistory
      .slice(-4)
      .map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    const prompt = `You are a customer support assistant. Generate a specific follow-up question.

RECENT CONVERSATION:
${historyStr}

ISSUE CATEGORY: ${category}
NEEDED INFORMATION: ${neededInfo.join(', ')}

Generate a professional, specific question to gather the needed information.

GUIDELINES:
- Ask for ONE piece of information at a time
- Be specific (e.g., "What is your order number?" not "Give me details")
- Be polite and professional
- Explain why you need it if relevant
- Keep it concise (1-2 sentences)

Generate the question:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 150,
      }
    });
    
    return result.response.text().trim();
    
  } catch (error) {
    console.error('[IntelligentConversation] Error generating follow-up:', error);
    return `To assist you, could you please provide: ${neededInfo[0]}?`;
  }
}

/**
 * Generate Solution
 * 
 * Generates a comprehensive solution based on gathered information.
 * 
 * @param conversationHistory - Conversation history
 * @param category - Issue category
 * @param collectedInfo - Information collected
 * @returns Solution response
 */
export async function generateSolution(
  conversationHistory: Message[],
  category: IssueCategory,
  collectedInfo: Record<string, string>
): Promise<string> {
  if (!genAI) {
    return "Thank you for providing all the necessary information. I've escalated your issue to our support team. You'll receive an update within 24 hours via email.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });
    
    const historyStr = conversationHistory
      .slice(-6)
      .map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    const infoStr = Object.entries(collectedInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const guidelines = getSolutionGuidelines(category);
    
    const prompt = `You are a professional e-commerce customer support assistant providing a final solution.

CONVERSATION SUMMARY:
${historyStr}

ISSUE CATEGORY: ${category}

INFORMATION COLLECTED:
${infoStr}

CATEGORY-SPECIFIC GUIDELINES:
${guidelines}

YOUR TASK:
Generate a comprehensive, professional solution that:

1. ACKNOWLEDGES the issue with empathy
   Example: "I understand how frustrating it is when..."

2. CONFIRMS what you'll do or what they should do
   Example: "I've escalated this to our logistics team" or "Here's how to resolve this..."

3. PROVIDES specific steps or timeline
   Example: "Within 24 hours, you'll receive..." or "Follow these steps: 1... 2... 3..."

4. SETS clear expectations
   Example: "You can expect resolution within 3-5 business days"

5. OFFERS continued support
   Example: "If you don't receive an update by [date], please contact us again"

TONE: Professional, empathetic, confident, and helpful

LENGTH: 4-6 sentences with clear structure

IMPORTANT:
- Be specific with timelines (24 hours, 3-5 business days, etc.)
- Include reference numbers if escalating (Ticket #TKT-[timestamp])
- Give actionable steps if self-service
- Explain what happens next
- Thank them for their patience

Generate the solution response:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 500,
      }
    });
    
    let solution = result.response.text().trim();
    
    // Add ticket number if escalation
    if (solution.toLowerCase().includes('escalat') || solution.toLowerCase().includes('team')) {
      const ticketNumber = `TKT-${Date.now()}`;
      solution = solution.replace(/Ticket #[^\s]+/g, `Ticket #${ticketNumber}`);
      if (!solution.includes('Ticket #')) {
        solution += `\n\nYour ticket number is #${ticketNumber} for reference.`;
      }
    }
    
    return solution;
    
  } catch (error) {
    console.error('[IntelligentConversation] Error generating solution:', error);
    const ticketNumber = `TKT-${Date.now()}`;
    return `Thank you for providing all the necessary information. I've created ticket #${ticketNumber} and escalated your ${category.toLowerCase().replace('_', ' ')} issue to our support team. You'll receive an email update within 24 hours. We appreciate your patience.`;
  }
}

/**
 * Get Solution Guidelines
 * 
 * Returns category-specific guidelines for generating solutions.
 */
function getSolutionGuidelines(category: IssueCategory): string {
  const guidelines: Record<IssueCategory, string> = {
    ORDER_STATUS: `
- Provide tracking information if available
- Explain current order status
- Give estimated delivery timeframe
- Suggest checking spam folder for confirmation emails`,
    
    DELIVERY_PROBLEM: `
- Acknowledge the inconvenience
- For delays: Explain common causes, provide updated timeline
- For wrong address: Explain how to intercept or redirect
- For lost packages: Initiate investigation, offer replacement or refund
- Always provide a resolution timeline`,
    
    PAYMENT_ISSUE: `
- Verify the payment method and amount
- For declined payments: Suggest checking with bank, trying different method
- For double charges: Explain refund process and timeline
- For wrong amounts: Verify order details, explain charges
- Provide reference numbers`,
    
    REFUND_REQUEST: `
- Explain refund eligibility based on reason
- Provide clear return instructions if needed
- State refund processing timeline (typically 5-7 business days)
- Mention refund method (original payment method)
- Provide return shipping label info if applicable`,
    
    PRODUCT_DEFECT: `
- Apologize for the inconvenience
- Offer replacement or refund options
- Provide return instructions
- Explain quality assurance process
- Set expectations for resolution timeline`,
    
    ACCOUNT_ACCESS: `
- For password reset: Provide step-by-step instructions
- For locked accounts: Explain unlock process
- For email issues: Suggest checking spam, adding to contacts
- Provide direct links to self-service tools
- Offer alternative contact methods if needed`,
    
    BILLING_INQUIRY: `
- Explain charges clearly
- Provide invoice/receipt access instructions
- Break down costs (subtotal, shipping, tax)
- Address any discrepancies
- Offer to email detailed breakdown`,
    
    CANCELLATION: `
- Check if order has shipped
- If not shipped: Confirm cancellation, explain refund timeline
- If shipped: Explain return process
- Provide cancellation confirmation number
- Set clear expectations`,
    
    OTHER: `
- Try to understand and categorize the issue
- Provide relevant general assistance
- If truly out of scope, politely redirect
- Offer to connect with appropriate team
- Be helpful and professional`
  };
  
  return guidelines[category] || guidelines.OTHER;
}

/**
 * Handle Out of Scope Query
 * 
 * Generates a polite response for queries outside e-commerce support.
 * 
 * @param userMessage - User's message
 * @returns Polite redirect response
 */
export async function handleOutOfScope(userMessage: string): Promise<string> {
  if (!genAI) {
    return "I'm here to help with e-commerce related questions like orders, delivery, refunds, and account issues. How can I assist you with your shopping experience today?";
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });
    
    const prompt = `The customer asked: "${userMessage}"

This is outside the scope of e-commerce customer support.

Generate a polite response that:
1. Acknowledges their message
2. Politely explains you're an e-commerce support assistant
3. Redirects to what you CAN help with (orders, delivery, refunds, products, account)
4. Asks how you can help with their shopping experience

Keep it friendly and professional (2-3 sentences).

Generate the response:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });
    
    return result.response.text().trim();
    
  } catch (error) {
    console.error('[IntelligentConversation] Error handling out of scope:', error);
    return "I'm here to help with your shopping experience - orders, delivery, refunds, products, and account issues. What can I assist you with today?";
  }
}

/**
 * Check if Question Already Answered
 * 
 * Checks if the assistant has already provided an answer to this question.
 * 
 * @param conversationHistory - Conversation history
 * @param currentMessage - Current user message
 * @returns Previous answer if found, null otherwise
 */
export function checkIfAlreadyAnswered(
  conversationHistory: Message[],
  currentMessage: string
): string | null {
  const currentLower = currentMessage.toLowerCase();
  
  // Look for similar previous user messages
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i];
    
    if (msg.role === 'user' && i > 0) {
      const prevLower = msg.content.toLowerCase();
      
      // Check for similarity (simple keyword matching)
      const currentWords = currentLower.split(/\s+/).filter(w => w.length > 3);
      const prevWords = prevLower.split(/\s+/).filter(w => w.length > 3);
      
      const commonWords = currentWords.filter(w => prevWords.includes(w));
      const similarity = commonWords.length / Math.max(currentWords.length, prevWords.length);
      
      // If messages are similar (>60% common words)
      if (similarity > 0.6 && i < conversationHistory.length - 1) {
        // Return the assistant's response that followed
        const nextMsg = conversationHistory[i + 1];
        if (nextMsg && nextMsg.role === 'assistant') {
          return nextMsg.content;
        }
      }
    }
  }
  
  return null;
}

/**
 * Extract Key Information
 * 
 * Extracts key information from conversation history.
 * 
 * @param conversationHistory - Conversation history
 * @returns Extracted information
 */
export function extractKeyInformation(
  conversationHistory: Message[]
): Record<string, any> {
  const info: Record<string, any> = {};
  
  conversationHistory.forEach((msg) => {
    if (msg.role === 'user') {
      const content = msg.content;
      
      // Extract order number
      const orderMatch = content.match(/ORD-\d{5}/i);
      if (orderMatch) info.orderNumber = orderMatch[0].toUpperCase();
      
      // Extract tracking number
      const trackingMatch = content.match(/TRK-\d+/i);
      if (trackingMatch) info.trackingNumber = trackingMatch[0].toUpperCase();
      
      // Extract email
      const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) info.email = emailMatch[0];
      
      // Extract phone
      const phoneMatch = content.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/);
      if (phoneMatch) info.phone = phoneMatch[0];
      
      // Check for yes/no responses
      const contentLower = content.toLowerCase().trim();
      if (contentLower === 'yes' || contentLower === 'no') {
        info.lastYesNo = contentLower;
      }
    }
  });
  
  return info;
}

/**
 * Should Provide Options
 * 
 * Determines if the assistant should provide multiple choice options.
 * 
 * @param question - The question being asked
 * @param category - Issue category
 * @returns Whether to provide options and what they should be
 */
export async function shouldProvideOptions(
  question: string,
  category?: IssueCategory
): Promise<{ shouldProvide: boolean; options?: string[] }> {
  // Don't provide options for open-ended questions
  const openEndedKeywords = [
    'order number', 'email', 'phone', 'address', 'name', 
    'tracking', 'describe', 'explain', 'tell me', 'what happened'
  ];
  
  const questionLower = question.toLowerCase();
  if (openEndedKeywords.some(keyword => questionLower.includes(keyword))) {
    return { shouldProvide: false };
  }
  
  // Provide options for categorical questions
  if (questionLower.includes('type of') || questionLower.includes('which') || 
      questionLower.includes('select') || questionLower.includes('choose')) {
    
    // Generate contextual options based on category
    const options = getContextualOptions(question, category);
    if (options.length > 0) {
      return { shouldProvide: true, options };
    }
  }
  
  return { shouldProvide: false };
}

/**
 * Get Contextual Options
 * 
 * Returns relevant options based on question and category.
 */
function getContextualOptions(question: string, category?: IssueCategory): string[] {
  const questionLower = question.toLowerCase();
  
  // Delivery problem types
  if (questionLower.includes('delivery') || questionLower.includes('shipping')) {
    return [
      'Package is delayed',
      'Wrong delivery address',
      'Package is damaged',
      'Package is lost',
      'Other delivery issue'
    ];
  }
  
  // Payment issue types
  if (questionLower.includes('payment') || questionLower.includes('charge')) {
    return [
      'Payment was declined',
      'Charged incorrect amount',
      'Charged multiple times',
      'Payment method not accepted'
    ];
  }
  
  // Refund reasons
  if (questionLower.includes('refund') || questionLower.includes('return')) {
    return [
      'Product is defective',
      'Wrong item received',
      'Changed my mind',
      'Found better price elsewhere'
    ];
  }
  
  // Yes/No questions
  if (questionLower.includes('have you') || questionLower.includes('did you') ||
      questionLower.includes('can you') || questionLower.includes('would you')) {
    return ['Yes', 'No'];
  }
  
  return [];
}
