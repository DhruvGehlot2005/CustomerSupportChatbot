# Step 2: Define Backend Decision Logic ✅

## Completed Tasks

### Type Definitions (`backend/src/types/index.ts`)
- ✅ Comprehensive TypeScript interfaces for entire system
- ✅ Issue category enums (9 predefined categories)
- ✅ Confidence level enums (HIGH, MEDIUM, LOW)
- ✅ Question types (single choice, multiple choice, text, yes/no, date, order ID)
- ✅ Resolution types (self-service, automated, escalation levels)
- ✅ Conversation modes (system-initiated, user-initiated)
- ✅ Session management types
- ✅ API request/response types
- ✅ Gemini integration types

### Issue Categories (`backend/src/config/issueCategories.ts`)
- ✅ 9 predefined issue categories with metadata:
  - ORDER_STATUS: Order tracking and shipping status
  - DELIVERY_PROBLEM: Delivery delays, wrong address, lost packages
  - PAYMENT_ISSUE: Payment processing problems
  - REFUND_REQUEST: Refund requests and status
  - PRODUCT_DEFECT: Quality issues and wrong items
  - ACCOUNT_ACCESS: Login and password issues
  - BILLING_INQUIRY: Invoice and billing questions
  - CANCELLATION: Order cancellation requests
  - OTHER: Fallback category
- ✅ Keywords for each category (for classification hints)
- ✅ Example queries for each category
- ✅ Priority levels for each category
- ✅ Helper functions for category lookup

### Question Trees (`backend/src/config/questionTrees.ts`)
- ✅ Complete question flows for each category
- ✅ Branching logic based on answers
- ✅ Validation rules for inputs
- ✅ Next question mapping (deterministic navigation)
- ✅ 8 detailed question trees:
  - Order Status: 3 questions with branching
  - Delivery Problem: 7 questions with complex branching
  - Payment Issue: 6 questions with branching
  - Refund Request: 8 questions with branching
  - Product Defect: 2 questions
  - Account Access: 6 questions with branching
  - Cancellation: 3 questions with branching
  - Billing Inquiry: 1 question
  - Other: 1 question (detailed description)
- ✅ Helper functions for tree navigation

### Resolution Paths (`backend/src/config/resolutionPaths.ts`)
- ✅ 30+ predefined resolution paths across all categories
- ✅ Condition-based path selection (deterministic)
- ✅ Resolution types:
  - Self-service: User can resolve themselves with steps
  - Automated action: System performs action automatically
  - Information provided: Answer with information
  - Escalate to agent: Human agent required
  - Escalate to specialist: Specialist team required
- ✅ Each resolution includes:
  - Conditions that must be met
  - Steps for self-service resolutions
  - Escalation reasons
  - Estimated resolution time
  - Required data fields
- ✅ Helper functions for finding matching resolutions

### System Constants (`backend/src/config/constants.ts`)
- ✅ Confidence thresholds:
  - HIGH: >= 0.8 (proceed with resolution)
  - MEDIUM: 0.5-0.79 (ask clarifying questions)
  - LOW: < 0.5 (ask multiple questions or escalate)
- ✅ Session configuration (timeout, limits)
- ✅ Gemini API configuration (model, temperature, tokens)
- ✅ Validation patterns (order ID, email, etc.)
- ✅ System-initiated flow structure (Mode 1)
- ✅ Response templates for consistent messaging
- ✅ Error messages
- ✅ Logging configuration
- ✅ Rate limiting configuration
- ✅ Feature flags

## Key Design Principles Implemented

### 1. Complete Determinism
- All categories are predefined (no AI invention)
- All question flows are predefined (no AI decision-making)
- All resolution paths are predefined (no AI-generated solutions)
- All branching logic is rule-based (no AI reasoning)

### 2. AI Constraint
- Gemini will ONLY be used for:
  - Classifying free-text into predefined categories
  - Generating natural language responses from templates
- Gemini will NOT:
  - Decide which questions to ask
  - Invent new categories
  - Create new resolution paths
  - Make any logical decisions

### 3. Type Safety
- Comprehensive TypeScript types throughout
- Enums for all categorical data
- Interfaces for all data structures
- Type guards for runtime safety

### 4. Maintainability
- Single source of truth for each concern
- Centralized configuration
- Helper functions for common operations
- Clear separation of concerns

## Data Structure Summary

### Issue Categories (9 total)
```
ORDER_STATUS → DELIVERY_PROBLEM → PAYMENT_ISSUE → REFUND_REQUEST
PRODUCT_DEFECT → ACCOUNT_ACCESS → BILLING_INQUIRY → CANCELLATION → OTHER
```

### Question Trees
- Each category has its own tree
- Trees have 1-8 questions depending on complexity
- Questions branch based on answers
- Validation rules ensure data quality

### Resolution Paths (30+ total)
- Multiple paths per category
- Conditions determine which path to take
- 5 resolution types available
- Estimated times provided for user expectations

### Confidence Levels
- HIGH (≥0.8): Proceed directly to resolution
- MEDIUM (0.5-0.79): Ask 1-2 clarifying questions
- LOW (<0.5): Ask multiple questions or escalate

## Example Flow

### User-Initiated Mode (Mode 2)
1. User: "My package hasn't arrived"
2. System classifies → DELIVERY_PROBLEM (confidence: 0.85 - HIGH)
3. System asks root question: "What type of delivery problem?"
4. User: "Package is delayed"
5. System asks: "How many days past expected delivery?"
6. User: "More than 5 days"
7. System matches conditions → Resolution: ESCALATE_AGENT
8. System generates response using template + Gemini
9. Creates ticket, provides ticket number and timeline

### System-Initiated Mode (Mode 1)
1. System: "Hello! What brings you here today?"
2. System presents main categories (Orders, Payments, Products, Account, Other)
3. User selects: "Orders & Delivery"
4. System presents subcategories
5. User selects: "Delivery Problem"
6. System follows DELIVERY_PROBLEM question tree
7. ... continues as above

## Files Created

```
backend/src/
├── types/
│   └── index.ts (450+ lines)
├── config/
│   ├── issueCategories.ts (200+ lines)
│   ├── questionTrees.ts (500+ lines)
│   ├── resolutionPaths.ts (700+ lines)
│   └── constants.ts (300+ lines)
```

**Total: ~2,150 lines of pure decision logic**

## Next Steps

**Step 3: Backend API Foundation** will implement:
1. Express routes for chat endpoints
2. Session management service
3. Conversation service (question flow logic)
4. Classification service (Gemini integration for NLU)
5. Resolution service (path matching logic)
6. Response generation service (Gemini integration for NLG)

---

**Status**: Step 2 Complete ✅
**Ready for**: Step 3 - Backend API Foundation
