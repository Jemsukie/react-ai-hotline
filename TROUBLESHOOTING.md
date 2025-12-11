# Troubleshooting Guide

## Error: ERR_CONNECTION_REFUSED / Failed to fetch

**Problem:** The frontend can't connect to the backend server.

**Solution:** Make sure your backend server is running!

### Steps to Fix:

1. **Open a new terminal window** (keep your React app running in the first terminal)

2. **Start the backend server:**
   ```bash
   yarn backend
   ```

3. **You should see:**
   ```
   🚀 Backend server running on http://localhost:4000
   📡 Retell endpoint: http://localhost:4000/api/retell/start
   ```

4. **Now try clicking the button again** in your React app

### Check if Backend is Running:

You can test if the backend is running by visiting:
- `http://localhost:4000/health` in your browser
- You should see: `{"status":"ok"}`

### Common Issues:

1. **Backend not started** - Run `yarn backend` in a separate terminal
2. **Wrong port** - Make sure backend is on port 4000 (check your `.env` file)
3. **Port already in use** - Another app might be using port 4000
4. **Missing dependencies** - Run `yarn install` first

### Running Both Servers:

You need **two terminals**:

**Terminal 1 (Backend):**
```bash
yarn backend
```

**Terminal 2 (Frontend):**
```bash
yarn local-start
```

Both should be running at the same time!

