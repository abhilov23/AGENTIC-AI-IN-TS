import OpenAI from "openai";
import "dotenv/config";
import { Context } from "hono";
import { streamText } from "hono/streaming";
import { z } from "zod";
const envSchema = z.object({
    NVIDIA_API_KEY: z.string().min(1, "NVIDIA_API_KEY is not set"),
    NVIDIA_BASE_URL: z.string().url("NVIDIA_BASE_URL must be a valid URL"),
    NVIDIA_MODEL: z.string().min(1, "NVIDIA_MODEL is not set"),
});
const env = envSchema.parse(process.env);
const openai = new OpenAI({
    apiKey: env.NVIDIA_API_KEY,
    baseURL: env.NVIDIA_BASE_URL,
});
export default async function callOpenAIWithHono(c) {
    const bodySchema = z.object({
        question: z.string().trim().min(1, "Question is required"),
    });
    let body;
    try {
        body = bodySchema.parse(await c.req.json());
    }
    catch {
        return c.json({ success: false, error: "Send JSON like {\"question\":\"...\"}" }, 400);
    }
    const { question } = body;
    if (!question) {
        return c.json({ success: false, error: "Question is required" }, 400);
    }
    return streamText(c, async (stream) => {
        try {
            const response = await openai.chat.completions.create({
                model: env.NVIDIA_MODEL,
                stream: true,
                messages: [
                    {
                        role: "user",
                        content: question,
                    },
                ],
            });
            for await (const chunk of response) {
                const token = chunk.choices[0]?.delta?.content;
                if (token) {
                    await stream.write(token);
                }
            }
        }
        catch (error) {
            console.error("Streaming request failed:", error);
            await stream.write("Failed to generate response.");
        }
    });
}
