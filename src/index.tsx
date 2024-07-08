import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";

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
    env: EnvVars,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const isSlackBotRequest = request.headers
      .get("user-agent")
      ?.includes("Slackbot");

    if (isSlackBotRequest) {
      const slackApp = getSlackApp(env);
      return await slackApp.run(request, ctx);
    }

    return await honoApp.fetch(request, env, ctx);
  },
};
