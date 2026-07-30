import OpenAI from "openai";
import "dotenv/config";
import { Context } from "hono";
import { z } from "zod";
import { weatherTool } from "./tools";
const envSchema = z.object({
    NVIDIA_API_KEY: z.string().min(1, "NVIDIA_API_KEY is not set"),
    NVIDIA_BASE_URL: z.string().url("NVIDIA_BASE_URL must be a valid URL"),
    NVIDIA_MODEL: z.string().min(1, "NVIDIA_MODEL is not set"),
});
const requestSchema = z.object({
    question: z.string().trim().min(1, "Question is required"),
});
const weatherArgsSchema = z.object({
    city: z.string().min(1, "City is required"),
});
const env = envSchema.parse(process.env);
const client = new OpenAI({
    apiKey: env.NVIDIA_API_KEY,
    baseURL: env.NVIDIA_BASE_URL,
});
const tools = [
    {
        type: "function",
        function: {
            name: "get_weather",
            description: "Get the current weather for a given location",
            parameters: {
                type: "object",
                properties: {
                    city: {
                        type: "string",
                        description: "City name (e.g. London, New York, Delhi)",
                    },
                },
                required: ["city"],
                additionalProperties: false,
            },
        },
    },
];
export async function runAgent(c) {
    let body;
    try {
        body = requestSchema.parse(await c.req.json());
    }
    catch {
        return c.json({ error: 'Send JSON like {"question":"What is the weather in Delhi?"}' }, 400);
    }
    const messages = [
        {
            role: "system",
            content: "You are a helpful assistant. Use the get_weather tool when the user asks for weather.",
        },
        {
            role: "user",
            content: body.question,
        },
    ];
    const firstResponse = await client.chat.completions.create({
        model: env.NVIDIA_MODEL,
        messages,
        tools,
        tool_choice: "auto",
    });
    const firstMessage = firstResponse.choices[0]?.message;
    if (!firstMessage) {
        return c.json({ error: "No response returned from model" }, 502);
    }
    messages.push(firstMessage);
    for (const toolCall of firstMessage.tool_calls ?? []) {
        if (toolCall.function.name !== "get_weather")
            continue;
        let parsedArgs;
        try {
            parsedArgs = weatherArgsSchema.parse(JSON.parse(toolCall.function.arguments || "{}"));
        }
        catch {
            return c.json({ error: "Model returned invalid tool arguments" }, 502);
        }
        const result = await weatherTool.execute(parsedArgs);
        messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
        });
    }
    const finalResponse = await client.chat.completions.create({
        model: env.NVIDIA_MODEL,
        messages,
    });
    return c.json({
        answer: finalResponse.choices[0]?.message?.content ?? "",
    });
}
