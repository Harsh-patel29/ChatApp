import { app } from "./src/app.js";
import http from "http";
import dotenv from "dotenv";
import { initWebSocket } from "./src/websockets/index.js"; // PascalCase

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Instantiate WebSocket server **once**
const wsServer = new initWebSocket(server);

// Optional: if you want to access io elsewhere
// app.set("wsServer", wsServer);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
