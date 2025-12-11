# Backend Setup for Retell AI

## Quick Setup (Option 1 - Simple)

### 1. Install Dependencies

Create a new folder for your backend (or use this one) and install:

```bash
npm install express cors dotenv
```

Or if you prefer yarn:
```bash
yarn add express cors dotenv
```

### 2. Create Backend `.env` File

Create a `.env` file in your backend folder with:

```env
RETELL_API_KEY=your_retell_api_key_here
RETELL_AGENT_ID=your_retell_agent_id_here
PORT=8910
```

**Important:** These are different from your React app's `.env` file. The backend `.env` should NOT have the `REACT_APP_` prefix.

### 3. Run the Backend Server

```bash
node backend-server-example.js
```

The server will run on `http://localhost:8910`

### 4. Update Frontend `.env`

Make sure your React app's `.env` has:

```env
REACT_APP_API_BASE_URL=http://localhost:8910
```

### 5. Test

1. Start backend: `node backend-server-example.js`
2. Start frontend: `yarn start`
3. Click the button to start a call!

## Alternative: Use Retell SDK

You can also use Retell's official SDK:

```bash
npm install retell-sdk
```

Then modify the endpoint to use the SDK instead of direct API calls.

## Production Deployment

For production:
- Deploy backend to a service like Railway, Render, or Vercel
- Update `REACT_APP_API_BASE_URL` to your production backend URL
- Make sure your backend `.env` has production credentials

