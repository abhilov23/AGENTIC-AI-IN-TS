import "dotenv/config"
import z from "zod"


const envSchema = z.object({
    NVIDIA_MODEL: z.string(),
    NVIDIA_API_KEY: z.string(),
    NVIDIA_BASE_URL: z.string(),
    CHROMA_URL: z.string().default("http://localhost:8000"),
})

export const env = envSchema.parse(process.env)