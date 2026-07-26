import { z } from 'zod';
import { createTool } from '@mastra/core/tools';

const EventSpecSchema = z.object({
  eventSpec: z.object({
    '@type': z.literal('com.cvent.EventSpec'), // this becomes a const in JSON Schema
    title: z.string(),
    date: z.string(),
  }),
});

const createEventTool = createTool({
  id: 'create-event',
  description: 'Creates a new event',
  inputSchema: EventSpecSchema,
  execute: async (_input, _context) => {
    return { success: true };
  },
});

// Case 1: LLM omits @type entirely
const inputMissing = {
  eventSpec: {
    title: 'Hackathon',
    date: '2026-06-01',
  },
};

// Case 2: LLM sends wrong value
const inputWrong = {
  eventSpec: {
    '@type': 'wrong.type.here',
    title: 'Hackathon',
    date: '2026-06-01',
  },
};

const result1 = EventSpecSchema.safeParse(inputMissing);
const result2 = EventSpecSchema.safeParse(inputWrong);

console.log(result1.success ? result1.data : result1.error.issues);
console.log(result2.success ? result2.data : result2.error.issues);
