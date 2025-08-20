import { serve } from "@hono/node-server";
import app from "./hono";

const port = 3000;

console.log(`🚀 Server is running on port ${port}`);
console.log(`📱 tRPC endpoint: http://localhost:${port}/api/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/`);

serve({
  fetch: app.fetch,
  port,
});
