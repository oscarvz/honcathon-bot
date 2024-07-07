import { createHonoMiddleware } from "@fiberplane/hono";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { type Env, Hono } from "hono";
import { SlackApp, type SlackEdgeAppEnv } from "slack-edge";

import { usersTable } from "./schema";
import type { EnvVars } from "./types";

const honoApp = new Hono<{ Bindings: EnvVars }>();

honoApp.use(createHonoMiddleware(honoApp));

honoApp.get("/", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
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
    const isSlackRequest = request.headers
      .get("user-agent")
      ?.includes("Slackbot");

    if (isSlackRequest) {
      const slackApp = new SlackApp({
        env: env as SlackEdgeAppEnv,
        socketMode: true,
      });

      slackApp.command(
        "/nagbot",
        async ({ context: { client, triggerId } }) => {
          if (!triggerId) {
            return "No trigger ID found";
          }

          await client.views.open({
            trigger_id: triggerId,
            view: {
              type: "modal",
              title: { type: "plain_text", text: "HONCATHON point system" },
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: "Pick a colleague from from the dropdown list",
                  },
                  accessory: {
                    type: "users_select",
                    placeholder: {
                      type: "plain_text",
                      text: "Select an item",
                    },
                    action_id: "user-selection-id",
                  },
                },
              ],
            },
          });
        },
      );

      slackApp.action("user-selection-id", async ({ context }) => {
        console.log("hello", context);
      });

      return await slackApp.run(request, ctx);
    }

    return honoApp.fetch(request, env, ctx);
  },
};
