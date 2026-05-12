import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { env } from "./env.js";
const embeddings = new OpenAIEmbeddings({
    model: "nvidia/nv-embed-v1",
    apiKey: env.NVIDIA_API_KEY,
    configuration: {
        baseURL: env.NVIDIA_BASE_URL,
    },
});
export default embeddings;
//# sourceMappingURL=embeddings.js.map