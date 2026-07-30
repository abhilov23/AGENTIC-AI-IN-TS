import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { runAgent } from "./agent";
import { logger } from "hono/logger";
const app = new Hono();
app.use('*', logger());
app.post('/', runAgent);
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
