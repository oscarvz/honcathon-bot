import { Hono } from "hono";
import { createHonoMiddleware } from "@fiberplane/hono";
import { extractTriggerId, SlackAPIClient } from "slack-edge";

type Env = {
  SLACK_BOT_TOKEN: string;
  SLACK_SIGNING_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use(createHonoMiddleware(app));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/slack-get", async (c) => {
  const slackClient = new SlackAPIClient(c.env.SLACK_BOT_TOKEN);

  try {
    const users = await slackClient.users.list();
    if (!users.ok || !users.members) {
      return;
    }

    const nonBotUsers = users.members.filter((user) => !user.is_bot);
    return c.json(nonBotUsers);
  } catch (error) {
    return c.json({ error: "Failed to fetch data" }, 500);
  }
});

app.post("/slack", async (c) => {
  const slackClient = new SlackAPIClient(c.env.SLACK_BOT_TOKEN);
  const body = await c.req.parseBody();
  const triggerId = extractTriggerId(body);
  if (!triggerId) {
    return c.newResponse("No trigger ID found", 400);
  }

  await slackClient.views.open({
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
            action_id: "users_select-action",
          },
        },
      ],
    },
  });

  return c.newResponse(null);
});

app.post("/slack/events", async (c) => {
  const slackClient = new SlackAPIClient(c.env.SLACK_BOT_TOKEN);
  const body = await c.req.parseBody();
  console.log("Event received", body);

  // await slackClient.chat.postMessage({
  //   channel: "channelId",
  //   text: "Event received",
  // });

  return c.newResponse(null);
});

export default app;

// import { SlackApp, type SlackEdgeAppEnv } from "slack-cloudflare-workers";

// export default {
//   async fetch(
//     request: Request,
//     env: SlackEdgeAppEnv,
//     ctx: ExecutionContext,
//   ): Promise<Response> {
//     const app = new SlackApp({ env });

//     // app.("/something", async () => {
//     //   return "holaaa";
//     // });

//     console.log("Request received", request.method, request.url);
//     // if (request.url === "POST") {
//     //   console.log("POST request received");
//     // }

//     app.action("/events", async ({ context: { client } }) => {
//       console.log("Event received");
//       // client.chat("Event received");
//     });

//     app.command("/nagbot", async ({ context: { client, triggerId } }) => {
//       // console.log("Command received", triggerId);
//       if (!triggerId) {
//         return;
//       }

//       await client.views.open({
//         trigger_id: triggerId,
//         view: {
//           type: "modal",
//           title: { type: "plain_text", text: "HONCATHON point system" },
//           blocks: [
//             {
//               type: "section",
//               text: {
//                 type: "mrkdwn",
//                 text: "Pick a colleague from from the dropdown list",
//               },
//               accessory: {
//                 type: "users_select",
//                 placeholder: {
//                   type: "plain_text",
//                   text: "Select an item",
//                 },
//                 action_id: "users_select-action",
//               },
//             },
//           ],
//         },
//       });
//     });

//     return await app.run(request, ctx);
//   },
// };
