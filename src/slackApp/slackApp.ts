import {
  SlackApp,
  type SlackEdgeAppEnv,
  type UsersSelectAction,
} from "slack-edge";

import { ACTION_ID_RATE_USER, ACTION_ID_SELECT_USER } from "./constants";

export function getSlackApp(env: SlackEdgeAppEnv) {
  const slackApp = new SlackApp({ env });

  slackApp.command("/nagbot", async ({ context: { client, triggerId } }) => {
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
              action_id: ACTION_ID_SELECT_USER,
              focus_on_load: true,
            },
          },
        ],
      },
    });
  });

  slackApp.action(
    ACTION_ID_SELECT_USER,
    async ({ context: { client }, payload: { actions, container } }) => {
      const viewId = container.view_id;
      const action = actions.find(
        (action): action is UsersSelectAction =>
          action.type === "users_select" &&
          action.action_id === ACTION_ID_SELECT_USER,
      );

      if (!action || !viewId) {
        return;
      }

      const { user } = await client.users.info({
        user: action.selected_user,
      });

      await client.views.update({
        view_id: viewId,
        view: {
          type: "modal",
          title: { type: "plain_text", text: "HONCATHON point system" },
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `Rate the demo of ${user?.real_name}!`,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Vote either :thumbsup: or :thumbsdown:",
              },
              accessory: {
                action_id: ACTION_ID_RATE_USER,
                type: "radio_buttons",
                options: [
                  {
                    text: { type: "mrkdwn", text: ":thumbsup:" },
                    value: "good",
                  },
                  {
                    text: { type: "mrkdwn", text: ":thumbsdown:" },
                    value: "bad",
                  },
                ],
              },
            },
          ],
        },
      });
    },
  );

  return slackApp;
}
