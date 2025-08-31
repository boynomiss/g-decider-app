import { serve } from "@hono/node-server";
import app from "./hono";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: './.env' });

const port = 3000;

console.log(`🚀 Server is running on port ${port}`);
console.log(`📱 tRPC endpoint: http://localhost:${port}/api/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/`);

serve({
  fetch: app.fetch,
  port,
});
