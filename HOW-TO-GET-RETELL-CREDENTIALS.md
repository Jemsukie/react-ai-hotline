# How to Get Retell AI Credentials

## Step 1: Sign Up / Log In to Retell AI

1. Go to [https://retellai.com](https://retellai.com)
2. Sign up for an account or log in

## Step 2: Get Your API Key

1. Go to your Retell AI Dashboard
2. Navigate to **Settings** or **API Keys** section
3. Look for **API Key** or **Bearer Token**
4. Copy your API key (it usually looks like: `sk-...` or `rt_...`)

## Step 3: Create or Get Your Agent ID

1. In the Retell AI Dashboard, go to **Agents** section
2. Either:
   - **Create a new agent** (if you don't have one)
   - **Use an existing agent**
3. Click on your agent to view details
4. Copy the **Agent ID** (usually a string like: `abc123...` or a UUID)

## Step 4: Add to Your `.env` File

Add these to your `.env` file (for the **backend**):

```env
# Backend - Retell AI (NO REACT_APP_ prefix!)
RETELL_API_KEY=your_actual_api_key_here
RETELL_AGENT_ID=your_actual_agent_id_here
PORT=4000
```

**Important Notes:**
- ✅ These go in the **backend** section (no `REACT_APP_` prefix)
- ✅ The frontend doesn't need these - it just calls your backend
- ✅ Keep your API key secret - never commit it to git!

## Step 5: Test

1. Start your backend: `yarn backend`
2. You should see: `🚀 Backend server running on http://localhost:4000`
3. If you see an error about missing credentials, double-check your `.env` file

## Troubleshooting

- **Can't find API Key?** Look in Settings → API Keys or Account Settings
- **Can't find Agent ID?** Go to Agents → Click on your agent → The ID is usually in the URL or agent details
- **Still having issues?** Check Retell AI's documentation or support

