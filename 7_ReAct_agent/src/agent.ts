import { Agent, setDefaultOpenAIClient, setOpenAIAPI, setTracingDisabled, run } from "@openai/agents";
import OpenAI from "openai";
import "dotenv/config";
import { weatherTool } from "./tools";
import { Context } from "hono";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: process.env.NVIDIA_BASE_URL!,
});

setDefaultOpenAIClient(client);
setOpenAIAPI("chat_completions"); 
setTracingDisabled(true); 

const agent = new Agent({
  name: "assistant",
  instructions: "You are a helpful assistant.",
  model: process.env.NVIDIA_MODEL!,
  tools: [weatherTool],
});

export async function runAgent(c: Context) {
  const body = await c.req.json();
  const question = body.question;

  const response = await run(agent, question);

  return c.json({ answer: response.finalOutput });
}