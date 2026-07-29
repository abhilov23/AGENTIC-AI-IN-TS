import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import callOpenAIWithHono from './agentic_intigration/model.js';
import { logger } from "hono/logger";
const app = new Hono();
app.use(logger());
app.get('/', (c) => c.text('Use POST /ask with a JSON body: {"question":"..."}'));
app.post('/ask', callOpenAIWithHono);
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
