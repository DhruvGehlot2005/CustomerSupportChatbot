/**
 * Gemini AI Service
 * 
 * Purpose: Interface with Google Gemini API for NLU and NLG.
 * 
 * CRITICAL CONSTRAINTS:
 * - Gemini is ONLY used for language understanding and generation
 * - Gemini does NOT make decisions or invent solutions
 * - All logic is predetermined; Gemini just translates language
 * 
 * Responsibilities:
 * 1. Classify user input into predefined categories
 * 2. Generate natural language responses from templates
 * 
 * Integration Points:
 * - Used by classification service for NLU
 * - Used by response service for NLG
 * - Constrained by prompts to prevent AI reasoning
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { IssueCategory, Message } from '../types';
import { GEMINI_CONFIG, FEATURE_FLAGS } from '../config/constants';
import { ISSUE_CATEGORIES } from '../config/issueCategories';

/**
 * Gemini API Client
 * 
 * Initialized with API key from environment variables.
 */
let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini Service
 * 
 * Sets up the Gemini API client.
 * Should be called when the server starts.
 * 
 * @throws Error if API key is not configured
 */
export function initializeGeminiService(): void {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  if (!FEATURE_FLAGS.ENABLE_GEMINI) {
    console.log('[GeminiService] Gemini integration is disabled by feature flag');
    return;
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  
  console.log('[GeminiService] Initialized successfully');
}

/**
 * Classify User Input
 * 
 * Uses Gemini to classify user's free-text input into one of the predefined categories.
 * 
 * CONSTRAINT: Gemini can ONLY choose from predefined categories.
 * The prompt is carefully crafted to prevent invention of new categories.
 * 
 * @param userMessage - User's message to classify
 * @param conversationHistory - Previous messages for context
 * @returns Category and confidence score
 */
export async function classifyUserInput(
  userMessage: string,
  conversationHistory: Message[]
): Promise<{ category: IssueCategory; confidence: number; reasoning: string }> {
  if (!genAI || !FEATURE_FLAGS.ENABLE_GEMINI) {
    // Fallback: simple keyword matching
    return fallbackClassification(userMessage);
  }
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_CONFIG.MODEL 
    });
    
    // Build context from conversation history
    const context = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    // Build category descriptions for the prompt
    const categoryDescriptions = Object.values(ISSUE_CATEGORIES)
      .map(cat => `- ${cat.category}: ${cat.description}`)
      .join('\n');
    
    // Strictly constrained prompt
    const prompt = `You are a customer support issue classifier. Your ONLY job is to classify the user's issue into ONE of the predefined categories below.

PREDEFINED CATEGORIES (you MUST choose one of these):
${categoryDescriptions}

CONVERSATION HISTORY:
${context}

CURRENT USER MESSAGE:
${userMessage}

INSTRUCTIONS:
1. Analyze the user's message and conversation history
2. Choose the MOST APPROPRIATE category from the list above
3. Provide a confidence score between 0 and 1
4. Provide brief reasoning

RESPOND IN THIS EXACT JSON FORMAT (no other text):
{
  "category": "CATEGORY_NAME",
  "confidence": 0.85,
  "reasoning": "Brief explanation"
}

IMPORTANT: You MUST use one of the exact category names listed above. Do NOT invent new categories.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: GEMINI_CONFIG.CLASSIFICATION_TEMPERATURE,
        maxOutputTokens: GEMINI_CONFIG.CLASSIFICATION_MAX_TOKENS,
      }
    });
    
    const response = result.response;
    const text = response.text();
    
    // Parse JSON response
    const parsed = parseClassificationResponse(text);
    
    console.log(`[GeminiService] Classified as ${parsed.category} with confidence ${parsed.confidence}`);
    
    return parsed;
    
  } catch (error) {
    console.error('[GeminiService] Classification error:', error);
    // Fallback to keyword matching
    return fallbackClassification(userMessage);
  }
}

/**
 * Generate Response
 * 
 * Uses Gemini to generate intelligent, context-aware responses.
 * 
 * @param template - Response template or guidance
 * @param context - Conversation context and data
 * @param tone - Desired tone
 * @returns Generated response text
 */
export async function generateResponse(
  template: string,
  context: Record<string, string>,
  tone: 'professional' | 'friendly' | 'apologetic' | 'informative' = 'professional'
): Promise<string> {
  if (!genAI || !FEATURE_FLAGS.ENABLE_GEMINI) {
    return fillTemplate(template, context);
  }
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_CONFIG.MODEL 
    });
    
    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const prompt = `You are a professional e-commerce customer support assistant helping customers with their issues.

TONE: ${tone}

GUIDANCE:
${template}

CONTEXT:
${contextStr}

INSTRUCTIONS:
1. Generate a helpful, professional response based on the guidance and context
2. Be empathetic and understanding of the customer's situation
3. Provide clear, actionable information
4. If asking questions, make them specific and relevant
5. Keep responses concise but complete (2-4 sentences)
6. Use a ${tone} tone throughout
7. Do NOT make up information not in the context

Generate the response (plain text, no JSON):`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: GEMINI_CONFIG.RESPONSE_TEMPERATURE,
        maxOutputTokens: GEMINI_CONFIG.RESPONSE_MAX_TOKENS,
      }
    });
    
    const response = result.response;
    const text = response.text().trim();
    
    console.log('[GeminiService] Generated response');
    
    return text;
    
  } catch (error) {
    console.error('[GeminiService] Response generation error:', error);
    return fillTemplate(template, context);
  }
}

/**
 * Generate Intelligent Response
 * 
 * Uses Gemini to generate context-aware responses with full conversation history.
 * This allows for more intelligent, adaptive conversations.
 * 
 * @param userMessage - Current user message
 * @param conversationHistory - Full conversation history
 * @param systemContext - System context (category, current question, etc.)
 * @returns Generated response
 */
export async function generateIntelligentResponse(
  userMessage: string,
  conversationHistory: Message[],
  systemContext: Record<string, any>
): Promise<string> {
  if (!genAI || !FEATURE_FLAGS.ENABLE_GEMINI) {
    return "I understand. Let me help you with that.";
  }
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_CONFIG.MODEL 
    });
    
    const historyStr = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    const contextStr = Object.entries(systemContext)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');
    
    const prompt = `You are a professional e-commerce customer support assistant. You help customers with orders, delivery, refunds, product issues, and account problems.

CONVERSATION HISTORY:
${historyStr}

CURRENT CUSTOMER MESSAGE:
${userMessage}

SYSTEM CONTEXT:
${contextStr}

YOUR ROLE:
- Help resolve customer issues professionally and empathetically
- Ask relevant follow-up questions to gather necessary information
- Provide clear solutions when you have enough information
- Be specific and actionable in your responses
- Show understanding and patience

GUIDELINES:
1. If the customer's issue is unclear, ask specific clarifying questions
2. If you need information (order number, email, etc.), ask for it clearly
3. If you can provide a solution, give clear step-by-step instructions
4. If the issue requires escalation, explain why and what will happen next
5. Always be professional, empathetic, and helpful
6. Keep responses concise (2-4 sentences) but complete
7. Do NOT make up order numbers, tracking numbers, or specific details
8. If you don't have enough information, ask for it

Generate your response as the assistant (plain text, no JSON):`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7, // Higher for more natural conversation
        maxOutputTokens: 300,
      }
    });
    
    const response = result.response;
    const text = response.text().trim();
    
    console.log('[GeminiService] Generated intelligent response');
    
    return text;
    
  } catch (error) {
    console.error('[GeminiService] Intelligent response error:', error);
    return "I understand your concern. Could you please provide more details so I can assist you better?";
  }
}

/**
 * Parse Classification Response
 * 
 * Parses Gemini's JSON response for classification.
 * Validates that the category is one of the predefined ones.
 * 
 * @param text - Raw response text from Gemini
 * @returns Parsed classification result
 */
function parseClassificationResponse(text: string): {
  category: IssueCategory;
  confidence: number;
  reasoning: string;
} {
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate category
    const category = parsed.category as IssueCategory;
    if (!Object.values(IssueCategory).includes(category)) {
      console.warn(`[GeminiService] Invalid category ${category}, defaulting to OTHER`);
      return {
        category: IssueCategory.OTHER,
        confidence: 0.3,
        reasoning: 'Category not recognized'
      };
    }
    
    // Validate confidence
    const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));
    
    return {
      category,
      confidence,
      reasoning: parsed.reasoning || 'No reasoning provided'
    };
    
  } catch (error) {
    console.error('[GeminiService] Failed to parse classification response:', error);
    return {
      category: IssueCategory.OTHER,
      confidence: 0.3,
      reasoning: 'Parse error'
    };
  }
}

/**
 * Fallback Classification
 * 
 * Simple keyword-based classification when Gemini is unavailable.
 * Not as sophisticated as Gemini, but provides basic functionality.
 * 
 * @param userMessage - User's message
 * @returns Classification result
 */
function fallbackClassification(userMessage: string): {
  category: IssueCategory;
  confidence: number;
  reasoning: string;
} {
  const messageLower = userMessage.toLowerCase();
  
  // Check each category's keywords
  for (const [category, metadata] of Object.entries(ISSUE_CATEGORIES)) {
    const matchCount = metadata.keywords.filter(keyword => 
      messageLower.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount > 0) {
      const confidence = Math.min(0.9, 0.5 + (matchCount * 0.1));
      return {
        category: category as IssueCategory,
        confidence,
        reasoning: `Matched ${matchCount} keywords (fallback classification)`
      };
    }
  }
  
  // Default to OTHER if no matches
  return {
    category: IssueCategory.OTHER,
    confidence: 0.4,
    reasoning: 'No keyword matches (fallback classification)'
  };
}

/**
 * Fill Template
 * 
 * Simple template filling when Gemini is unavailable.
 * Replaces {placeholder} with values from context.
 * 
 * @param template - Template string with {placeholders}
 * @param context - Values to fill in
 * @returns Filled template
 */
function fillTemplate(template: string, context: Record<string, string>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return result;
}

/**
 * Test Gemini Connection
 * 
 * Tests if Gemini API is accessible and working.
 * Useful for health checks and debugging.
 * 
 * @returns True if connection is working
 */
export async function testGeminiConnection(): Promise<boolean> {
  if (!genAI || !FEATURE_FLAGS.ENABLE_GEMINI) {
    return false;
  }
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_CONFIG.MODEL 
    });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 10,
      }
    });
    
    const response = result.response;
    const text = response.text();
    
    return text.length > 0;
    
  } catch (error) {
    console.error('[GeminiService] Connection test failed:', error);
    return false;
  }
}
