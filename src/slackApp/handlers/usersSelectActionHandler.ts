import type { BlockActionAckHandler, StaticSelectAction } from "slack-edge";

import { getDb } from "@/db";
import type { EnvVars } from "@/types";
import {
  ACTION_ID_RATE_USER,
  ACTION_ID_SELECT_USER,
  VIEW_CALLBACK_ID,
} from "../constants";

type Handler = BlockActionAckHandler<"static_select", EnvVars>;

export const usersSelectActionHandler: Handler = async ({
  context: { client, userId },
  env,
  payload: { actions, container },
}) => {
  const viewId = container.view_id;
  const action = actions.find(
    (action): action is StaticSelectAction =>
      action.type === "static_select" &&
      action.action_id === ACTION_ID_SELECT_USER,
  );
  const userResponse =
    action && (await client.users.info({ user: action.selected_option.value }));
  if (!(action && viewId && userId && userResponse?.user)) {
    return; // TODO: Add error handling
  }

  const db = getDb(env.DATABASE_URL);
  const ratingByCurrentUser = await db.query.ratings.findFirst({
    where: (users, { and, eq }) =>
      and(
        eq(users.ratedById, userId),
        eq(users.userId, action.selected_option.value),
      ),
  });

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
            text: `${
              ratingByCurrentUser ? "Update score for" : "Rate the demo of"
            } ${userResponse.user.real_name}!`,
          },
        },
        {
          block_id: userResponse.user.id,
          type: "input",
          label: {
            type: "plain_text",
            text: "Range between 0 and 10",
          },
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            action_id: ACTION_ID_RATE_USER,
            max_value: "10",
            focus_on_load: true,
            initial_value: ratingByCurrentUser?.score.toString(),
          },
        },
      ],
      submit: { type: "plain_text", text: "Submit" },
    },
  });
};
