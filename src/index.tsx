import { createHonoMiddleware } from "@fiberplane/hono";
import { type Env, Hono } from "hono";
import type { SlackEdgeAppEnv } from "slack-edge";

import { getDb } from "@/db";
import { usersTable } from "@/schema";
import { getSlackApp } from "@/slackApp";
import type { EnvVars } from "@/types";

const honoApp = new Hono<{ Bindings: EnvVars }>();

honoApp.use(createHonoMiddleware(honoApp));

honoApp.get("/", async (c) => {
  const db = getDb(c);
  const users = await db.select().from(usersTable);

  return c.html(
    <div>
      <h1>Hello, World!</h1>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>,
  );
});

export default {
  async fetch(
    request: Request,
    env: Env | SlackEdgeAppEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const isSlackBotRequest = request.headers
      .get("user-agent")
      ?.includes("Slackbot");

    if (isSlackBotRequest) {
      const slackApp = getSlackApp(env as SlackEdgeAppEnv);
      return slackApp.run(request, ctx);
    }

    return honoApp.fetch(request, env, ctx);
  },
};
