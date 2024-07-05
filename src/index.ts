import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";

import { selectedUser, slashCommand } from "./routeHandlers";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.use(createHonoMiddleware(app));

app.post("/slack", slashCommand);
app.post("/slack/events", selectedUser);

export default app;
