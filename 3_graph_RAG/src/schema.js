import { z } from "zod";
export const relationshipSchema = z.object({
    source: z.string(),
    relationship: z.string(),
    target: z.string(),
});
export const extractionSchema = z.array(relationshipSchema);
