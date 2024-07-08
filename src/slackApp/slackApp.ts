import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { SlackApp, type UsersSelectAction } from "slack-edge";

import { scoresTable, usersTable } from "@/schema";
import type { EnvVars } from "@/types";
import {
  ACTION_ID_RATE_USER,
  ACTION_ID_SELECT_USER,
  VIEW_CALLBACK_ID,
} from "./constants";

export function getSlackApp(env: EnvVars) {
  const slackApp = new SlackApp({ env });

  slackApp.command("/nagbot", async ({ context: { client, triggerId } }) => {
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
  });

  slackApp.action(
    ACTION_ID_SELECT_USER,
    async ({
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
    },
  );

  slackApp.viewSubmission(
    VIEW_CALLBACK_ID,
    async ({ context, payload: { user, view } }) => {
      const action = Object.entries(view.state.values).find(([_, value]) =>
        Object.keys(value).find((value) => value === ACTION_ID_RATE_USER),
      );
      if (!action) {
        return;
      }

      const rating = action[1][ACTION_ID_RATE_USER].value;
      if (!rating) {
        return;
      }

      const targetUserId = action[0];
      const score = Number.parseInt(rating, 10);

      const sql = neon(env.DATABASE_URL);
      const db = drizzle(sql);

      // Add both the current user & user that's being rated to the database
      for (const slackUserId of [user.id, targetUserId]) {
        const slackUser = await context.client.users.info({
          user: slackUserId,
        });
        if (
          !slackUser.user ||
          !slackUser.user.real_name ||
          !slackUser.user.id
        ) {
          continue;
        }

        await db
          .insert(usersTable)
          .values({
            name: slackUser.user.real_name,
            slackId: slackUser.user.id,
          })
          .onConflictDoNothing({ target: usersTable.slackId });
      }

      // Then we can add the rating to the database
      const [storedUser] = await db
        .selectDistinct({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.slackId, targetUserId));

      await db.insert(scoresTable).values({
        ratedBySlackUserId: user.id,
        score,
        slackUserId: targetUserId,
        userId: storedUser.id,
      });
    },
  );

  return slackApp;
}
