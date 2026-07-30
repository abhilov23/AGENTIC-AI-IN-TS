import { Agent, setDefaultOpenAIClient, setOpenAIAPI, setTracingDisabled, run } from "@openai/agents";
import OpenAI from "openai";
import "dotenv/config";
import { Context } from "hono";
import { webSearch } from "./tools";


const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: process.env.NVIDIA_BASE_URL!,
});

setDefaultOpenAIClient(client);
setOpenAIAPI("chat_completions"); 
setTracingDisabled(true); 

const agent = new Agent({
  name: "planner",
  instructions: `
Break the user's request into small executable steps.

Do not use any tools.

Return only the numbered plan.
`,
  model: process.env.NVIDIA_MODEL!,
});


const executor = new Agent({
  name: "Executor",

  instructions: `
Execute the supplied plan one step at a time.

Use available tools whenever necessary.
`,
  model: process.env.NVIDIA_MODEL!,
  tools: [webSearch],
});


export async function planAndExecute(c: Context) {
    const { question } = await c.req.json();

  const response = await run(agent, question);
   
  const executorResponse = await run(executor, response.finalOutput!);
  
  return c.json({
    plan: response.finalOutput,
    result: executorResponse.finalOutput,
  });
 
}