# How to Create a Retell AI Agent

## Step 1: Log In to Retell AI Dashboard

1. Go to [https://retellai.com](https://retellai.com) or your Retell AI dashboard
2. Log in to your account

## Step 2: Navigate to Agents

1. In the dashboard, look for **"Agents"** in the sidebar or top navigation
2. Click on **"Agents"** or **"Create Agent"** button

## Step 3: Create New Agent

1. Click **"Create Agent"** or **"New Agent"** button
2. You'll see a form with several fields:

### Basic Information:
- **Agent Name**: Give it a name (e.g., "Jemwealth AI Assistant")
- **Description**: Optional description

### Voice Settings:
- **Voice**: Choose a voice for your agent
- **Language**: Select the language
- **Speaking Rate**: Adjust if needed

### AI Configuration:
- **LLM Provider**: Choose your LLM (OpenAI, Anthropic, etc.)
- **Model**: Select the model (GPT-4, Claude, etc.)
- **System Prompt**: This is important! Add your agent's instructions

### System Prompt Example for Jemwealth:
```
You are Jemwealth AI, the official assistant for jemwealth.co. 
You only answer using verified information from jemwealth.co. 
If information does not exist on the website, say: 
"I'm not sure about that — please visit jemwealth.co for more details." 
Keep answers friendly and concise.
```

## Step 4: Configure Knowledge Base (Optional)

- You can add knowledge from jemwealth.co
- Upload documents or connect data sources
- This helps the agent answer questions accurately

## Step 5: Save and Get Agent ID

1. Click **"Create"** or **"Save"** button
2. After creation, you'll be taken to the agent details page
3. **Copy the Agent ID** - it's usually:
   - In the URL (e.g., `/agents/abc123...`)
   - In the agent details/settings
   - Displayed prominently on the agent page

## Step 6: Add Agent ID to Your `.env`

Add it to your `.env` file:

```env
RETELL_AGENT_ID=your_agent_id_here
```

## Quick Tips:

- **Test your agent** in the Retell dashboard before using it in your app
- **System prompt is key** - make it clear and specific
- **Voice selection** - choose one that matches your brand
- **Knowledge base** - add your website content for better answers

## Troubleshooting:

- **Can't find "Create Agent"?** Look for a "+" button or "New" button
- **Agent ID not visible?** Check the URL or agent settings page
- **Need help?** Check Retell AI's documentation or support

