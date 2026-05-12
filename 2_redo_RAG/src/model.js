import { env } from "./env.js";
import { ChatOpenAI } from "@langchain/openai";
export const model = new ChatOpenAI({
    model: env.NVIDIA_MODEL,
    apiKey: env.NVIDIA_API_KEY,
    configuration: {
        baseURL: env.NVIDIA_BASE_URL,
    },
    temperature: 0,
});
//# sourceMappingURL=model.js.map