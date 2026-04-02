import { createApp } from "../src/app.js";

// Vercel serverless entry point - exports the Express app
// instead of calling app.listen()
const app = createApp();

export default app;
