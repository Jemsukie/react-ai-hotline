# Debugging Backend 500 Error

## Check Backend Terminal

Look at the terminal where you ran `yarn backend` - you should see error messages like:
- "Retell API error: ..."
- "Status: ..."
- "API Key present: ..."
- "Agent ID present: ..."

## Common Issues:

### 1. Missing Credentials in .env

Make sure your `.env` file has:
```env
RETELL_API_KEY=key_your_actual_key_here
RETELL_AGENT_ID=your_actual_agent_id_here
```

**Note:** These should NOT have `REACT_APP_` prefix for the backend!

### 2. Wrong API Endpoint

The endpoint might have changed. Check Retell AI documentation for the correct endpoint.

### 3. API Key Format

Make sure your API key is correct and not expired.

### 4. Agent ID Format

Make sure your Agent ID is correct.

## To See Detailed Errors:

1. Check the backend terminal output
2. The improved error logging will show:
   - Whether credentials are present
   - The actual error from Retell API
   - Status codes

## Next Steps:

1. **Check backend terminal** for the actual error message
2. **Verify .env file** has correct credentials (no REACT_APP_ prefix for backend vars)
3. **Check Retell AI dashboard** to confirm your API key and Agent ID are correct

