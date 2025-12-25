# AI-Assisted Customer Support System

## Overview
A full-stack AI-powered customer issue diagnosis and resolution chatbot for e-commerce, similar to enterprise systems like Amazon's customer support.

## Key Principles
- **NOT a general chatbot** - Focused on structured customer support
- **Gemini for NLU/NLG only** - All decision logic is deterministic and backend-controlled
- **Predefined resolution paths** - No AI-invented solutions or categories

## Architecture
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express + TypeScript
- **AI**: Gemini API (constrained for language understanding and generation only)

## Project Structure
```
ai-customer-support/
├── frontend/          # React + TypeScript UI
├── backend/           # Node.js + Express API
├── package.json       # Root workspace configuration
└── README.md          # This file
```

## Features

### Dummy E-commerce Website
- Hardcoded product listings
- Product detail pages
- Fake login/signup (no real authentication)
- Immersive shopping experience

### Chatbot Modes

#### Mode 1: System-Initiated (Guided Support)
- Chatbot starts the conversation
- Universal issue-resolution flow
- Step-by-step guidance (order → delivery → payment → refund → account)
- Adaptive questioning to narrow down issues

#### Mode 2: User-Initiated (Free-Text Support)
- User describes issue in natural language
- System classifies into predefined categories
- Follow-up questions based on previous answers
- Resolution or escalation

## AI Usage Constraints
Gemini is strictly limited to:
- Interpreting free-text into predefined labels
- Generating professional customer-service responses

Gemini does NOT:
- Decide outcomes
- Invent solutions
- Create new issue categories

All logic is controlled by backend decision trees.

## Development Setup

### Prerequisites
- Node.js 18+ LTS
- npm 9+

### Installation
```bash
npm run install:all
```

### Development
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### Build
```bash
npm run build:frontend
npm run build:backend
```

## Environment Variables
Create `.env` files in both frontend and backend directories:

### Backend `.env`
```
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:3000
```

## Development Status
- [x] Step 1: Project Setup & Structure
- [ ] Step 2: Define Backend Decision Logic
- [ ] Step 3: Backend API Foundation
- [ ] Step 4: Dummy E-commerce Website
- [ ] Step 5: Chatbot UI Component
- [ ] Step 6: Mode 1 - System-Initiated Flow
- [ ] Step 7: Mode 2 - User-Initiated Flow
- [ ] Step 8: Integration & Testing

## License
MIT
