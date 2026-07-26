import { z } from 'zod';

// point to your local build after making the fix
const { validateToolInput } = await import(
  './node_modules/@mastra/core/dist/tools/validation.js'
);

const EventSpecSchema = z.object({
  eventSpec: z.object({
    '@type': z.literal('com.cvent.EventSpec'),
    title: z.string(),
    date: z.string(),
  }),
});

// Case 1: missing @type
const result1 = validateToolInput(EventSpecSchema, {
  eventSpec: { title: 'Hackathon', date: '2026-06-01' },
}, 'create-event');

// Case 2: wrong @type
const result2 = validateToolInput(EventSpecSchema, {
  eventSpec: { '@type': 'wrong.type.here', title: 'Hackathon', date: '2026-06-01' },
}, 'create-event');

console.log('Case 1:', result1.error ? '❌ FAIL' : '✅ PASS', JSON.stringify(result1, null, 2));
console.log('Case 2:', result2.error ? '❌ FAIL' : '✅ PASS', JSON.stringify(result2, null, 2));