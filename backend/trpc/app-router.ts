import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { spreadsheetRouter } from "./routes/spreadsheet/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  spreadsheet: spreadsheetRouter,
});

export type AppRouter = typeof appRouter;