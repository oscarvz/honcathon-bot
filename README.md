# HONCATHON Bot

Hack project: cheeky Slack bot for giving your colleagues scores for their
HONCathon project demos.
This project is basically only here to play around with Hono, Drizzle ORM, Neon,
and Cloudflare Workers (HONC).

It's using FPX for monitoring requests to speed up the development process.

## Run locally

Create a `.dev.vars` and provide the following environment variables

```
SLACK_BOT_TOKEN=xoxb-[your token]
SLACK_SIGNING_SECRET=[your token]
DATABASE_URL=postgresql://neondb_owner:[your token].aws.neon.tech/neondb?sslmode=require
```

Then run the project locally:

```shell
bun install
bun run dev
```

This'll spin up your worker instance & serves it on `localhost:8787`.

Pipe your server locally to your Slack bot API using Ngrok or VS Code ports,
suffix it with `/slack` & hook it up to your Slack app, and install the app in
your workspace.
You can now use the `/honcathonbot` slash command in Slack!

### FPX Studio

In a separate terminal, run the following command to start FPX:

```shell
bun run studio
```
