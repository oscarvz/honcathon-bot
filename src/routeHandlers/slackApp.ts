import type { Context } from "hono";
import { env } from "hono/adapter";
import { SlackApp } from "slack-edge";

import type { EnvVars } from "../types";

export function slackApp(c: Context) {
  const envVars = env<EnvVars>(c);
  const app = new SlackApp({ env: envVars });
}
