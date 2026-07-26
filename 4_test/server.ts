import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { MCPServer } from '@mastra/mcp';
import { z } from 'zod';

const server = new MCPServer({
  name: 'event-server',
  version: '1.0.0',
  tools: {
    'create-event': {
      description: 'Creates a new event',
      inputSchema: z.object({
        eventSpec: z.object({
          '@type': z.literal('com.cvent.EventSpec'),
          title: z.string(),
          date: z.string(),
        }),
      }),
      execute: async (_input: unknown, context: unknown) => {
        console.log('EXECUTE CALLED, context:', JSON.stringify(context));
        if (!context) {
          console.log('BUG CONFIRMED: context is undefined');
          return { success: false };
        }
        console.log('Tool executed with:', JSON.stringify(context, null, 2));
        return { success: true };
      },
    },
  },
});

const httpServer = http.createServer(async (req, res) => {
  await server.startHTTP({
    url: new URL(req.url || '', 'http://localhost:4111'),
    httpPath: '/mcp',
    req,
    res,
    options: {
      sessionIdGenerator: () => randomUUID(),
    },
  });
});

httpServer.listen(4111, () => {
  console.log('MCP Server running on http://localhost:4111/mcp');
});
