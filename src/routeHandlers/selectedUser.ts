import type { Context } from "hono";
import { SlackAPIClient, type UsersSelectAction } from "slack-edge";

import { ACTION_ID } from "./slashCommand";

export async function selectedUser(c: Context) {
  const slackClient = new SlackAPIClient(c.env.SLACK_BOT_TOKEN);
  const body: Record<"payload", string> = await c.req.parseBody();
  const payload = JSON.parse(body.payload);
  const viewId = extractViewId(payload);

  const actions: Array<UsersSelectAction> = payload.actions;
  const action = actions.find((action) => action.action_id === ACTION_ID);
  if (!viewId || !action) {
    return c.newResponse("No view ID found", 400);
  }

  const selectedUser = await slackClient.users.info({
    user: action.selected_user,
  });

  const slackResponse = await slackClient.views.update({
    view_id: viewId,
    view: {
      type: "modal",
      title: { type: "plain_text", text: "HONCATHON point system" },
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `Rate the demo of ${selectedUser.user?.real_name}!`,
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

export function extractViewId(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  payload: Record<string, any>,
): string | undefined {
  if (payload.view.id) {
    return payload.view.id;
  }
  return undefined;
}
