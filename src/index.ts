import { Hono } from "hono";
import { createHonoMiddleware } from "@fiberplane/hono";

const app = new Hono();

// NOTE - You should pass the `app` to createHonoMiddleware
//        to be able to tell fpx about your registered routes
app.use(createHonoMiddleware(app));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// With the beta middleware, this fetch call will be logged in the fpx studio UI
app.get("/fetch", async (c) => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data: unknown = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: "Failed to fetch data" }, 500);
  }
});

export default app;
