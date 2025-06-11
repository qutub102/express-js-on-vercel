import { createServer } from "http"  
import express from "express"

const WebSocket = require('ws');
const { getSession, updateSession } = require('./sessionStore');

// 🔑 Global socket map — very important
const socketMap = {}; // email → socket

const wss = new WebSocket.Server({ port: 8080 });
const app = express()
const server = createServer(app)

console.log("✅ WebSocket server started on ws://localhost:8080");

wss.on('connection', (socket) => {
  console.log("🎉 New connection");

  socket.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { email, browserId } = data;

      if (data.type === 'register') {
        const oldBrowserId = getSession(email);

        if (oldBrowserId && oldBrowserId !== browserId && socketMap[email]) {
          console.log(`⚠️ Duplicate login for ${email}, invalidating old session`);
          socketMap[email].send(JSON.stringify({ type: 'invalidate' }));
          socketMap[email].close();
        }

        // ✅ Register new session
        updateSession(email, browserId);
        socketMap[email] = socket;

        console.log(`✅ ${email} is now connected with browserId ${browserId}`);
      }
    } catch (err) {
      console.error("❌ Invalid message", err);
    }
  });

  socket.on('close', () => {
    console.log("🔴 Socket closed");
    // Optional: clean up socketMap here if needed
  });
});

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`WebSocket server ready for connections`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Server closed")
  })
})
