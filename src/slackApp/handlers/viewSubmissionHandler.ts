import type { ViewSubmissionAckHandler } from "slack-edge";

import { getDb } from "@/db";
import { ratings, users } from "@/schema";
import type { EnvVars } from "@/types";
import { ACTION_ID_RATE_USER } from "../constants";

export const viewSubmissionHandler: ViewSubmissionAckHandler<EnvVars> = async ({
  context: { client },
  env,
  payload: { user, view },
}) => {
  const [[targetUserId, action]] = Object.entries(view.state.values);
  const rating = action[ACTION_ID_RATE_USER].value;
  if (!rating) {
    return; // TODO: Add error handling
  }

  const targetSlackUser = await client.users.info({ user: targetUserId });
  if (!targetSlackUser.user?.real_name) {
    return; // TODO: Add error handling
  }

  const db = getDb(env.DATABASE_URL);

  // Add the user that's being rated to the database
  await db
    .insert(users)
    .values({
      id: targetUserId,
      name: targetSlackUser.user.real_name,
    })
    .onConflictDoNothing({ target: users.id });

  // Then we can add the rating to the database
  await db.insert(ratings).values({
    userId: targetUserId,
    ratedById: user.id,
    score: Number.parseInt(rating, 10),
  });
};
