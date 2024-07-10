import type { PlainTextOption, SlashCommandAckHandler } from "slack-edge";

import { ACTION_ID_SELECT_USER, VIEW_CALLBACK_ID } from "../constants";

export const slashCommandHandler: SlashCommandAckHandler = async ({
  context: { client, triggerId, userId },
}) => {
  const { members } = await client.users.list();
  if (!members || !triggerId) {
    return; /* TODO: Handle exception */
  }

  // We're not here to rate bots or the current user, so we filter them out
  const options = members.reduce<Array<PlainTextOption>>(
    (accumulator, { id, real_name, is_bot }) => {
      const isValidUser = !is_bot && id && real_name;
      const isCurrentUser = id === userId;
      const isSlackBot = id === "USLACKBOT";

      if (isValidUser && !isCurrentUser && !isSlackBot) {
        return accumulator.concat({
          text: {
            type: "plain_text",
            text: real_name,
          },
          value: id,
        });
      }

      return accumulator;
    },
    [],
  );

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
            type: "static_select",
            placeholder: {
              type: "plain_text",
              text: "Select HONCATHON hacking colleague",
            },
            action_id: ACTION_ID_SELECT_USER,
            focus_on_load: true,
            options,
          },
        },
      ],
    },
  });
};
