import { createApp } from "./app.js";
import { env } from "./config/env.js";
import http from "http";
import { socketService } from "./lib/socket.js";

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

server.listen(env.PORT, () => {
  console.log(`OSTA API listening on http://localhost:${env.PORT}`);
});
