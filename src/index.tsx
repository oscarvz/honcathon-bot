import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";
import { showRoutes } from "hono/dev";

import { getDb } from "@/db";
import { usersTable } from "@/schema";
import { getSlackApp } from "@/slackApp";
import type { EnvVars } from "@/types";

const app = new Hono<{ Bindings: EnvVars }>();
showRoutes(app);

app.use(createHonoMiddleware(app));

app.use("/slack*", async (c, next) => {
  const isSlackRequest = c.req.raw.headers.has("x-slack-signature");
  if (isSlackRequest) {
    const slackApp = getSlackApp(c.env);
    return await slackApp.run(c.req.raw, c.executionCtx);
  }

  return await next();
});

app.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const users = await db.select().from(usersTable);

  return c.html(
    <div>
      <h1>Hello Honc!</h1>

      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>,
  );
});

export default app;
