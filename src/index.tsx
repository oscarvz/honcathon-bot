import { createHonoMiddleware } from "@fiberplane/hono";
import { type Env, Hono } from "hono";
import { SlackApp, type SlackEdgeAppEnv } from "slack-edge";

import type { EnvVars } from "./types";

const honoApp = new Hono<{ Bindings: EnvVars }>();

honoApp.use(createHonoMiddleware(honoApp));

honoApp.get("/", (c) => c.html(<h1>Hello, World!</h1>));

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
      const slackApp = new SlackApp<SlackEdgeAppEnv>({
        env: env as SlackEdgeAppEnv,
      }).command("/nagbot", async (req) => {
        return ":wave: Nagbot here! I'm on it! :robot_face:";
      });

      return await slackApp.run(request, ctx);
    }

    return honoApp.fetch(request, env, ctx);
  },
};
