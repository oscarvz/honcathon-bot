import { SlackApp } from "slack-edge";

import type { EnvVars } from "@/types";
import { ACTION_ID_SELECT_USER, VIEW_CALLBACK_ID } from "./constants";
import {
  slashCommandHandler,
  usersSelectActionHandler,
  viewSubmissionHandler,
} from "./handlers";

export function getSlackApp(env: EnvVars) {
  const slackApp = new SlackApp({ env });

  slackApp.command("/nagbot", slashCommandHandler);
  slackApp.action(ACTION_ID_SELECT_USER, usersSelectActionHandler);
  slackApp.viewSubmission(VIEW_CALLBACK_ID, viewSubmissionHandler);

  return slackApp;
}
