# Project Context Documentation

## Project: AI-Assisted Customer Support System

### Last Updated
2025-12-25

### Architecture Overview
Full-stack application with strict separation of concerns:
- **UI Layer**: React + TypeScript (presentation only)
- **Decision Logic Layer**: Node.js backend (deterministic rules)
- **Language Layer**: Gemini API (NLU/NLG only, no reasoning)

### Core Constraints
1. Gemini MUST NOT make decisions or invent solutions
2. All issue categories are predefined in backend
3. All resolution paths are deterministic
4. Gemini only translates natural language ↔ structured data

### Technology Stack
- **Frontend**: React 18+, TypeScript 5+, Vite 5+
- **Backend**: Node.js 18+ LTS, Express 4+, TypeScript 5+
- **AI**: Google Gemini API
- **State Management**: React Context API (frontend), In-memory sessions (backend)

### Data Models
**Issue Categories (9 predefined)**
- ORDER_STATUS, DELIVERY_PROBLEM, PAYMENT_ISSUE, REFUND_REQUEST
- PRODUCT_DEFECT, ACCOUNT_ACCESS, BILLING_INQUIRY, CANCELLATION, OTHER

**Question Trees**
- 8 detailed question trees with branching logic
- 1-8 questions per category
- Validation rules for input quality
- Deterministic navigation based on answers

**Resolution Paths (30+ predefined)**
- Self-service, automated action, information provided
- Escalate to agent, escalate to specialist
- Condition-based path selection
- Estimated resolution times

**Confidence Thresholds**
- HIGH: ≥0.8 (proceed with resolution)
- MEDIUM: 0.5-0.79 (ask clarifying questions)
- LOW: <0.5 (ask multiple questions or escalate)

### API Endpoints (To Be Defined in Step 3)
- Chat interaction endpoints
- Session management
- Issue classification
- Resolution retrieval

### Outstanding Issues
None yet - project just initialized

### Technical Debt
None yet - project just initialized

### Development Progress
- **Step 1**: ✅ Project setup and structure initialized
- **Step 2**: ✅ Backend decision logic defined (~2,150 lines)
- **Step 3**: ✅ Backend API foundation complete (~2,350 lines)
- **Step 4**: ✅ Dummy e-commerce website complete (~2,500 lines)
- **Step 5**: ✅ Chatbot UI component complete (~1,130 lines)
- **Step 6**: ✅ Mode 1 (System-Initiated) - Integrated in Step 5
- **Step 7**: ✅ Mode 2 (User-Initiated) - Integrated in Step 5
- **Step 8**: ✅ Integration & Testing - Complete

## 🎉 PROJECT COMPLETE

All 8 steps have been successfully completed. The AI-assisted customer support system is fully functional.
- **Step 4**: ⏳ Pending - Dummy e-commerce website
- **Step 5**: ⏳ Pending - Chatbot UI component
- **Step 6**: ⏳ Pending - Mode 1 implementation
- **Step 7**: ⏳ Pending - Mode 2 implementation
- **Step 8**: ⏳ Pending - Integration & testing

### Dependencies
All dependencies use stable LTS versions. Lock files ensure reproducible builds.

### Security Considerations
- API keys stored in environment variables only
- Input validation on all user inputs
- No real authentication (fake login for demo purposes)
- No sensitive data storage

### Performance Considerations
- In-memory session management (suitable for demo)
- Gemini API rate limiting to be implemented
- Frontend code splitting for optimal load times

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Semantic HTML throughout

### Testing Strategy (To Be Implemented)
- Unit tests for backend decision logic
- Integration tests for API endpoints
- Component tests for React UI
- End-to-end tests for complete flows

### Notes
- This is a demonstration system, not production-ready
- No real database - all data is hardcoded or in-memory
- Focus on architecture and AI integration patterns
