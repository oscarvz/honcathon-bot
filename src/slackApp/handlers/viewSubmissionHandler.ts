import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { ViewSubmissionAckHandler } from "slack-edge";

import { scoresTable, usersTable } from "@/schema";
import type { EnvVars } from "@/types";
import { ACTION_ID_RATE_USER } from "../constants";

export const viewSubmissionHandler: ViewSubmissionAckHandler<EnvVars> = async ({
  context,
  env,
  payload: { user, view },
}) => {
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
  const targetSlackUser = await context.client.users.info({
    user: targetUserId,
  });
  // TODO: Add error handling
  if (!targetSlackUser.user?.real_name) {
    return;
  }

  // Add the user that's being rated to the database
  await db
    .insert(usersTable)
    .values({
      id: targetUserId,
      name: targetSlackUser.user.real_name,
    })
    .onConflictDoNothing({ target: usersTable.id });

  // Then we can add the rating to the database
  await db.insert(scoresTable).values({
    userId: targetUserId,
    ratedById: user.id,
    score,
  });
};
