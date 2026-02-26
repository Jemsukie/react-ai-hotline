// Express server for Retell AI integration (Docker version)
// This version serves the React app from the build folder
// Run with: node backend-server-docker.js
//
// Make sure your .env file has:
// RETELL_API_KEY=your_key_here
// RETELL_AGENT_ID=your_agent_id_here
// PORT=4000

const express = require("express");
const cors = require("cors");
const path = require("path");
const Retell = require("retell-sdk");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

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

    // Use Retell SDK to create a web call
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

    // Extract response data
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

    const accessToken =
      webCallResponse.access_token || webCallResponse.accessToken;

    const clientToken =
      webCallResponse.client_token ||
      webCallResponse.clientToken ||
      accessToken;

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

    // Return access_token/clientToken if available, otherwise websocket_url
    if (accessToken || clientToken) {
      const token = accessToken || clientToken;
      console.log("Web call created successfully with access_token:", callId);
      return res.json({
        callId: callId,
        sessionId: callId,
        clientToken: token,
        accessToken: token,
        wsUrl: wsUrl || null,
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

    console.error(
      "No clientToken or websocket_url in response. Available keys:",
      Object.keys(webCallResponse)
    );
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

// Serve static files from React app build folder
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

// Serve React app (SPA routing) - all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(buildPath, "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Retell endpoint: http://0.0.0.0:${PORT}/api/retell/start`);
  console.log(`🌐 Serving React app from: ${buildPath}`);
});



