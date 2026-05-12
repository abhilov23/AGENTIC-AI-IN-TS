import { ChatOpenAI } from "@langchain/openai";
import { env } from "./env.js";

export const model = new ChatOpenAI({
  model: env.NVIDIA_MODEL,
  apiKey: env.NVIDIA_API_KEY,
  configuration: {
    baseURL: env.NVIDIA_BASE_URL,
  },
  temperature: 0,
});