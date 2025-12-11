# How to Run the App

## Quick Start

### 1. Install Dependencies
```bash
yarn install
```

### 2. Set Up Environment Variables

Add these to your `.env` file (same file for both frontend and backend):

```env
# Retell AI (for backend)
RETELL_API_KEY=your_retell_api_key_here
RETELL_AGENT_ID=your_retell_agent_id_here
PORT=4000

# Frontend config
REACT_APP_API_BASE_URL=http://localhost:4000
REACT_APP_RETELL_API_URL=https://api.retellai.com/v1
```

### 3. Run Both Servers

**Option A: Run separately (recommended for development)**

Terminal 1 - Backend:
```bash
yarn backend
```

Terminal 2 - Frontend:
```bash
yarn local-start
```

**Option B: Run both at once (requires `concurrently`)**

First install concurrently:
```bash
yarn add -D concurrently
```

Then run:
```bash
yarn dev
```

## What Happens

1. **Backend** runs on `http://localhost:4000`
   - Handles `/api/retell/start` endpoint
   - Calls Retell API securely (keeps your API key on server)

2. **Frontend** runs on `http://localhost:3000`
   - React app with the call button
   - Connects to backend to start Retell sessions

## Testing

1. Open `http://localhost:3000` in your browser
2. Click "📞 Start Call" button
3. Allow microphone access when prompted
4. You should connect to Retell AI!

## Notes

- ✅ Express backend is in the same project (totally fine for samples!)
- ✅ API key stays secure on the backend
- ✅ No NGROK needed for basic calls
- ⚠️ Make sure Node.js version is 18+ (for native fetch support)

