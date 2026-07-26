import http from 'node:http';
import 'dotenv/config';
import { createTool } from '@mastra/core/tools';
import { Agent } from '@mastra/core/agent';
import { MCPServer, MCPClient } from '@mastra/mcp';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';

const nim = createOpenAICompatible({
  name: 'nvidia-nim',
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY!,
});

const createEventTool = createTool({
  id: 'create-event',
  description: 'Creates a new event with a discriminator field',
  inputSchema: z.object({
    eventSpec: z.object({
      '@type': z.literal('com.cvent.EventSpec'),
      title: z.string(),
      date: z.string(),
    }),
  }),
  execute: async ({ context }: any) => {
    console.log('🔴 execute called, context:', JSON.stringify(context));
    return { success: true, event: context };
  },
});

const server = new MCPServer({
  name: 'Test MCP Server',
  version: '1.0.0',
  tools: { createEventTool },
});

const PORT = 9700;
const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  await server.startHTTP({ url, httpPath: '/mcp', req, res });
});
await new Promise<void>(resolve => httpServer.listen(PORT, resolve));
console.log(`MCP Server running on http://localhost:${PORT}/mcp`);

const client = new MCPClient({
  servers: {
    local: {
      url: new URL(`http://localhost:${PORT}/mcp`),
    },
  },
});

const tools = await client.listTools();
console.log('Available tools:', Object.keys(tools));
console.log('\nTool schema:', JSON.stringify(tools['local_createEventTool']?.inputSchema, null, 2));

console.log('\n--- Direct validation test ---');
const tool = tools['local_createEventTool'];
const llmInput = {
  eventSpec: {
    title: 'Hackathon',
    date: '2026-06-01',
    // @type missing — LLM doesn't know the constant value
  },
};
const result = await tool.execute?.(llmInput as any);
console.log('Direct result:', JSON.stringify(result, null, 2));

console.log('\n--- Agent test ---');
const agent = new Agent({
  id: 'event-agent',
  name: 'event-agent',
  instructions: 'You help create events. Always call the create-event tool.',
  model: nim('meta/llama-3.1-70b-instruct'),
  tools,
});

const response = await agent.generate('Create an event called Hackathon on 2026-06-01');
console.log('Agent response:', response.text);

httpServer.close();
await server.close();