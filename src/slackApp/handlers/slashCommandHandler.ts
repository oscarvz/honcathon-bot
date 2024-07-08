import type { SlashCommandAckHandler } from "slack-edge";

import type { EnvVars } from "@/types";
import { ACTION_ID_SELECT_USER, VIEW_CALLBACK_ID } from "../constants";

export const slashCommandHandler: SlashCommandAckHandler<EnvVars> = async ({
  context: { client, triggerId },
}) => {
  if (!triggerId) {
    return "No trigger ID found";
  }

  await client.views.open({
    trigger_id: triggerId,
    view: {
      type: "modal",
      callback_id: VIEW_CALLBACK_ID,
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
};
