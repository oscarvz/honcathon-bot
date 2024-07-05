import type { Context } from "hono";
import {
  type BlockAction,
  type RadioButtonsAction,
  SlackAPIClient,
  type UsersSelectAction,
} from "slack-edge";

import { ACTION_ID } from "./slackSlashCommandHandler";

export async function slackEventsHandler(c: Context) {
  const slackClient = new SlackAPIClient(c.env.SLACK_BOT_TOKEN);
  const requestBody: Record<"payload", string> = await c.req.parseBody();
  const payload: BlockAction<UsersSelectAction | RadioButtonsAction> =
    JSON.parse(requestBody.payload);

  const viewId = extractViewId(payload);
  if (!viewId) {
    return c.newResponse("No view ID found", 400);
  }

  const actions = payload.actions;
  const userSelectAction = actions.find(
    (action): action is UsersSelectAction =>
      action.type === "users_select" && action.action_id === ACTION_ID,
  );
  if (!userSelectAction) {
    return c.newResponse("No user selected", 400);
  }

  const slackEventsHandler = await slackClient.users.info({
    user: userSelectAction.selected_user,
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
            text: `Rate the demo of ${slackEventsHandler.user?.real_name}!`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Vote either :thumbsup: or :thumbsdown:",
          },
          accessory: {
            action_id: "vote",
            type: "radio_buttons",
            options: [
              { text: { type: "mrkdwn", text: ":thumbsup:" }, value: "good" },
              { text: { type: "mrkdwn", text: ":thumbsdown:" }, value: "bad" },
            ],
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
