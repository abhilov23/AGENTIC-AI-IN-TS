import { z } from 'zod';
import 'dotenv/config';
import { createTool } from '@mastra/core/tools';
import { Agent } from '@mastra/core/agent';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const nim = createOpenAICompatible({
  name: 'nvidia-nim',
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY!,
});

const createEventTool = createTool({
  id: 'create-event',
  description: 'Creates a new event. Always call this when asked to create an event.',
  inputSchema: z.object({
    eventSpec: z.object({
      '@type': z.literal('com.cvent.EventSpec'),
      title: z.string(),
      date: z.string(),
    }),
  }),
  execute: async (_input, context) => {
    console.log('Tool executed with:', JSON.stringify(context, null, 2));
    return { success: true };
  },
});

const agent = new Agent({
  id: 'event-agent',
  name: 'event-agent',
  instructions: 'You help create events. When asked, always call the create-event tool.',
  model: nim('meta/llama-3.1-70b-instruct'),
  tools: { createEventTool },
});

const response = await agent.generate(
  'Create an event called Hackathon on 2026-06-01'
);

console.log('Response:', response.text);
