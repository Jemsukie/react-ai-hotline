// Simple Express server for Retell AI integration
// Run with: yarn backend
// Or: node backend-server-example.js
//
// Make sure your .env file has:
// RETELL_API_KEY=your_key_here
// RETELL_AGENT_ID=your_agent_id_here
// PORT=4000

const express = require("express");
const cors = require("cors");
const Retell = require("retell-sdk");
require("dotenv").config();

const app = express();
// Backend always runs on port 4000 (not in .env to avoid React picking it up)
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Retell AI endpoint
app.post("/api/retell/start", async (req, res) => {
  try {
    const retellApiKey = process.env.RETELL_API_KEY;
    const agentId = process.env.RETELL_AGENT_ID;

    console.log("Starting Retell session...");
    console.log("API Key present:", !!retellApiKey);
    console.log("Agent ID present:", !!agentId);
    console.log(
      "Agent ID value:",
      agentId ? `${agentId.substring(0, 10)}...` : "missing"
    );

    if (!retellApiKey || !agentId) {
      console.error("Missing credentials!");
      return res.status(500).json({
        error: "Missing Retell API credentials. Check your .env file.",
        missing: {
          apiKey: !retellApiKey,
          agentId: !agentId,
        },
      });
    }

    // Use Retell SDK to create a web call (for realtime web-based calls)
    // Reference: https://docs.retellai.com/api-references/create-web-call
    const client = new Retell({
      apiKey: retellApiKey,
    });

    console.log("Creating web call with Retell SDK...");
    console.log("Using agent_id:", agentId);

    let webCallResponse;
    try {
      webCallResponse = await client.call.createWebCall({
        agent_id: agentId,
      });
      console.log(
        "Retell API response:",
        JSON.stringify(webCallResponse, null, 2)
      );
    } catch (sdkError) {
      console.error("Retell SDK error:", sdkError);
      console.error("Error message:", sdkError.message);
      console.error("Error stack:", sdkError.stack);
      if (sdkError.response) {
        console.error("Error response:", sdkError.response);
      }
      return res.status(500).json({
        error: "Retell SDK error",
        message: sdkError.message,
        details: sdkError.response || sdkError.body || "No additional details",
      });
    }

    // Log all keys in the response to see what we actually get
    console.log("Response keys:", Object.keys(webCallResponse));
    console.log("Full response object:", webCallResponse);

    // For web calls, Retell SDK returns call_id and websocket_url
    // Try all possible field name variations
    const callId =
      webCallResponse.call_id ||
      webCallResponse.callId ||
      webCallResponse.id ||
      webCallResponse.call_id_number;

    const wsUrl =
      webCallResponse.websocket_url ||
      webCallResponse.websocketUrl ||
      webCallResponse.ws_url ||
      webCallResponse.wsUrl;

    // Retell returns access_token (JWT) which can be used as clientToken
    const accessToken =
      webCallResponse.access_token || webCallResponse.accessToken;

    // Also check for clientToken (if present)
    const clientToken =
      webCallResponse.client_token ||
      webCallResponse.clientToken ||
      accessToken; // access_token works as clientToken

    if (!callId) {
      console.error(
        "No call_id in response. Available keys:",
        Object.keys(webCallResponse)
      );
      return res.status(500).json({
        error: "No call_id received from Retell API",
        response: webCallResponse,
        availableKeys: Object.keys(webCallResponse),
      });
    }

    // Return access_token/clientToken if available (newer API), otherwise websocket_url
    if (accessToken || clientToken) {
      const token = accessToken || clientToken;
      console.log("Web call created successfully with access_token:", callId);
      return res.json({
        callId: callId,
        sessionId: callId,
        clientToken: token, // access_token works as clientToken for Retell Web Client SDK
        accessToken: token, // Also include as accessToken for clarity
        wsUrl: wsUrl || null, // Include if available for backward compatibility
      });
    }

    if (wsUrl) {
      console.log("Web call created successfully with websocket_url:", callId);
      return res.json({
        callId: callId,
        sessionId: callId,
        wsUrl: wsUrl,
        clientToken: null,
      });
    }

    // Neither clientToken nor wsUrl found
    console.error(
      "No clientToken or websocket_url in response. Available keys:",
      Object.keys(webCallResponse)
    );
    console.error("Full response:", JSON.stringify(webCallResponse, null, 2));
    return res.status(500).json({
      error: "No clientToken or websocket_url received from Retell API",
      response: webCallResponse,
      availableKeys: Object.keys(webCallResponse),
    });
  } catch (error) {
    console.error("Error starting Retell session:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Function to kill process on port 4000 (Windows)
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    // Windows command to find and kill process on port
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (stdout) {
        const lines = stdout.trim().split("\n");
        const pids = new Set();
        lines.forEach((line) => {
          const match = line.match(/\s+(\d+)$/);
          if (match) {
            pids.add(match[1]);
          }
        });
        if (pids.size > 0) {
          console.log(`🔄 Killing process(es) on port ${port}...`);
          let killedCount = 0;
          pids.forEach((pid) => {
            exec(`taskkill /PID ${pid} /F`, (err) => {
              if (err) {
                console.log(`⚠️  Could not kill process ${pid}:`, err.message);
              } else {
                console.log(`✅ Killed process ${pid}`);
              }
              killedCount++;
              if (killedCount === pids.size) {
                // Wait a bit for processes to be killed
                setTimeout(resolve, 1000);
              }
            });
          });
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  });
}

// Kill any process on port 4000, then start server
killProcessOnPort(PORT)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(
        `📡 Retell endpoint: http://localhost:${PORT}/api/retell/start`
      );
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  });
