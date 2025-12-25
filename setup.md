# Setup Instructions

## Step 1: Install Dependencies

Run from the root directory:

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## Step 2: Configure Environment Variables

### Backend Environment
Copy the example file and add your Gemini API key:

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` and add your Gemini API key:
```
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_actual_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment
Copy the example file:

```bash
cd frontend
copy .env.example .env
```

The default values should work:
```
VITE_API_URL=http://localhost:3000
```

## Step 3: Run the Application

### Option 1: Run Both Servers Separately

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Option 2: Use the Root Scripts

Terminal 1:
```bash
npm run dev:backend
```

Terminal 2:
```bash
npm run dev:frontend
```

## Step 4: Verify Installation

1. Backend health check: http://localhost:3000/health
2. Frontend: http://localhost:5173

## Getting a Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into `backend/.env`

## Troubleshooting

### Port Already in Use
If port 3000 or 5173 is already in use, change the PORT in the respective .env files.

### Module Not Found
Run `npm install` in the root, backend, and frontend directories.

### TypeScript Errors
Ensure you're using Node.js 18+ LTS and TypeScript 5+.
