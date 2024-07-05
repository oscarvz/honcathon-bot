import type { Context } from "hono";
import { env } from "hono/adapter";
import { extractTriggerId, SlackAPIClient } from "slack-edge";

import type { Env } from "../types";

export const ACTION_ID = "action-user-selection";

export async function slackSlashCommandHandler(c: Context) {
  const { SLACK_BOT_TOKEN } = env<Env>(c);
  const slackClient = new SlackAPIClient(SLACK_BOT_TOKEN);

  const requestBody = await c.req.parseBody();
  const triggerId = extractTriggerId(requestBody);
  if (!triggerId) {
    return c.newResponse("No trigger ID found", 400);
  }

  const slackResponse = await slackClient.views.open({
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
            action_id: ACTION_ID,
          },
        },
      ],
    },
  });

  if (!slackResponse.ok || slackResponse.error) {
    return c.newResponse(slackResponse.error ?? "Error opening modal", 500);
  }

  for (const [header, value] of slackResponse.headers) {
    c.header(header, value);
  }

  return c.newResponse(null);
}
