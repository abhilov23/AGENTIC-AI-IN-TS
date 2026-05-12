import { ChatOpenAI } from '@langchain/openai';
import "dotenv/config";

export const model = new ChatOpenAI({
    model: process.env.NVIDIA_MODEL,
    apiKey: process.env.NVIDIA_API_KEY,
    configuration: {
        baseURL: process.env.NVIDIA_BASE_URL,
    },
    temperature: 0,
});