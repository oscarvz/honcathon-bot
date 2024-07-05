import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";

import { slackEventsHandler, slackSlashCommandHandler } from "./routeHandlers";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.use(createHonoMiddleware(app));

app.post("/slack", slackSlashCommandHandler);
app.post("/slack/events", slackEventsHandler);

export default app;
