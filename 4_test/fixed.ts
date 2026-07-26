import { z } from 'zod';

function injectConstFields(schema: any, input: unknown): unknown {
  if (
    schema.type !== 'object' ||
    !schema.properties ||
    input == null ||
    typeof input !== 'object' ||
    Array.isArray(input)
  ) {
    return input;
  }

  const obj = { ...(input as Record<string, unknown>) };

  for (const [key, propSchema] of Object.entries(schema.properties) as any) {
    if (typeof propSchema === 'object' && 'const' in propSchema) {
      obj[key] = propSchema.const;
    } else if (typeof propSchema === 'object' && propSchema.type === 'object') {
      obj[key] = injectConstFields(propSchema, obj[key] ?? {});
    }
  }

  return obj;
}

const EventSpecSchema = z.object({
  eventSpec: z.object({
    '@type': z.literal('com.cvent.EventSpec'),
    title: z.string(),
    date: z.string(),
  }),
});

const inputMissing = {
  eventSpec: { title: 'Hackathon', date: '2026-06-01' },
};

const inputWrong = {
  eventSpec: { '@type': 'wrong.type.here', title: 'Hackathon', date: '2026-06-01' },
};

const schemaWithConsts = {
  type: 'object',
  properties: {
    eventSpec: {
      type: 'object',
      properties: {
        '@type': { const: 'com.cvent.EventSpec' },
        title: { type: 'string' },
        date: { type: 'string' },
      },
    },
  },
};

const fixed1 = injectConstFields(schemaWithConsts, inputMissing);
const fixed2 = injectConstFields(schemaWithConsts, inputWrong);

console.log('Fixed 1:', JSON.stringify(fixed1, null, 2));
console.log('Fixed 2:', JSON.stringify(fixed2, null, 2));

const r1 = EventSpecSchema.safeParse(fixed1);
const r2 = EventSpecSchema.safeParse(fixed2);

console.log('Validation 1:', r1.success ? 'PASS' : 'FAIL');
console.log('Validation 2:', r2.success ? 'PASS' : 'FAIL');
