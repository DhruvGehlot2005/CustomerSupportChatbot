# Testing Guide - Improved Chatbot

## Quick Start

1. **Start Backend:**
```bash
cd backend
npm run dev
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Open Browser:**
http://localhost:5173/support

## Test Scenarios

### Test 1: Delivery Delay (Full Conversation)
**Goal**: Test continuous questioning until resolution

1. Click "Describe Your Issue"
2. Type: "My package hasn't arrived"
3. Bot should ask for order number
4. Type: "ORD-12345"
5. Bot should ask how many days delayed
6. Select: "More than 5 days"
7. Bot should provide detailed solution or escalate

**Expected**: Multiple relevant questions, specific solution with timeline

---

### Test 2: Refund Request (Options + Text)
**Goal**: Test mix of options and free text

1. Start new chat
2. Type: "I need a refund"
3. Bot should show refund reason options
4. Select: "Product is defective"
5. Bot should ask if already returned (Yes/No options)
6. Select: "Yes"
7. Bot should ask for tracking number (free text)
8. Type: "TRK-9876543210"
9. Bot should provide refund timeline and process

**Expected**: Smart option usage, detailed refund instructions

---

### Test 3: Account Password Reset (Self-Service)
**Goal**: Test self-service solution

1. Start new chat
2. Type: "I forgot my password"
3. Bot should ask if tried forgot password link
4. Select: "No"
5. Bot should provide step-by-step reset instructions

**Expected**: Clear, actionable steps without escalation

---

### Test 4: Out of Scope Query
**Goal**: Test handling of non-e-commerce questions

1. Start new chat
2. Type: "What's the weather today?"
3. Bot should politely redirect to e-commerce topics

**Expected**: Professional redirect, not error or confusion

---

### Test 5: Payment Issue (Escalation)
**Goal**: Test appropriate escalation

1. Start new chat
2. Type: "I was charged twice"
3. Bot should ask for details
4. Provide order number and amount
5. Bot should escalate to billing team

**Expected**: Escalation with ticket number and timeline

---

### Test 6: Product Question (Vague to Specific)
**Goal**: Test clarification questions

1. Start new chat
2. Type: "I have a problem with my order"
3. Bot should ask what kind of problem
4. Type: "The product is broken"
5. Bot should ask for more details
6. Provide details
7. Bot should offer replacement or refund

**Expected**: Progressive clarification, specific solution

---

### Test 7: System-Initiated Mode
**Goal**: Test guided support

1. Click "Guided Support"
2. Select category: "Orders & Delivery"
3. Follow the guided questions
4. Provide answers
5. Receive solution

**Expected**: Structured flow with clear options

---

## What to Look For

### ✅ Good Responses:
- Specific and actionable
- Include timelines
- Show empathy
- Ask relevant follow-up questions
- Provide clear next steps
- Use appropriate tone

### ❌ Bad Responses:
- Vague or generic
- No timeline or expectations
- Irrelevant questions
- Premature conclusion
- Confusing instructions

## Common Issues & Solutions

### Issue: Bot gives vague response
**Solution**: Provide more context in your message

### Issue: Bot asks for info you already gave
**Solution**: This shouldn't happen - report if it does

### Issue: Bot concludes too early
**Solution**: This is fixed - bot should continue until resolved

### Issue: No options when expected
**Solution**: Options only show for categorical questions

### Issue: Options when not needed
**Solution**: Free text required for order numbers, emails, etc.

## Evaluation Criteria

Rate each conversation on:
1. **Relevance** (1-5): Questions are relevant to the issue
2. **Completeness** (1-5): Gathers all necessary information
3. **Clarity** (1-5): Responses are clear and specific
4. **Professionalism** (1-5): Maintains appropriate tone
5. **Resolution** (1-5): Provides satisfactory solution

**Target**: Average score of 4+ across all criteria

## Advanced Testing

### Test Edge Cases:
- Very long messages
- Multiple issues in one message
- Changing topic mid-conversation
- Providing wrong format (e.g., invalid order number)
- Refusing to provide information
- Asking same question multiple times

### Test Different Categories:
- Order Status
- Delivery Problems
- Payment Issues
- Refund Requests
- Product Defects
- Account Access
- Billing Inquiries
- Cancellations

### Test Conversation Patterns:
- Short answers vs detailed answers
- Using options vs typing freely
- Correcting previous answers
- Asking for clarification
- Expressing frustration

## Success Metrics

The improved chatbot should:
- ✅ Ask 3-5 relevant questions before resolution
- ✅ Provide specific solutions with timelines
- ✅ Show options for 60-70% of questions
- ✅ Handle out-of-scope queries gracefully
- ✅ Escalate appropriately (20-30% of cases)
- ✅ Resolve issues without escalation (70-80% of cases)

## Feedback

If you find issues or have suggestions:
1. Note the conversation flow
2. Identify where it went wrong
3. Suggest what should have happened
4. Check if it's a prompt issue or logic issue

---

**Happy Testing!** 🎉

The chatbot should now provide professional, helpful, and complete support for e-commerce issues.
