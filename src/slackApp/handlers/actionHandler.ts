import type { BlockActionAckHandler, UsersSelectAction } from "slack-edge";

import {
  ACTION_ID_RATE_USER,
  ACTION_ID_SELECT_USER,
  VIEW_CALLBACK_ID,
} from "../constants";

export const actionHandler: BlockActionAckHandler<"users_select"> = async ({
  context: { client, userId },
  payload: { actions, container },
}) => {
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

  // TODO: Add error handling
  if (!user) {
    return;
  }

  if (userId === action.selected_user) {
    await client.views.update({
      view_id: viewId,
      view: {
        callback_id: VIEW_CALLBACK_ID,
        type: "modal",
        title: { type: "plain_text", text: "HONCATHON point system" },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "You cannot rate yourself! Please select another user.",
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
  }

  await client.views.update({
    view_id: viewId,
    view: {
      callback_id: VIEW_CALLBACK_ID,
      type: "modal",
      title: { type: "plain_text", text: "HONCATHON point system" },
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `Rate the demo of ${user.real_name}!`,
          },
        },
        {
          block_id: user.id,
          type: "input",
          label: {
            type: "plain_text",
            text: "Please rate between 0 and 10",
          },
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            action_id: ACTION_ID_RATE_USER,
            max_value: "10",
            focus_on_load: true,
          },
        },
      ],
      submit: { type: "plain_text", text: "Submit" },
    },
  });
};
