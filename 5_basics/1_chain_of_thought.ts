import OpenAI from "openai";
import "dotenv/config";


const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: process.env.NVIDIA_BASE_URL,
})

const response = await client.chat.completions.create({
    model: process.env.NVIDIA_MODEL,
    messages: [
        {
            role: "user",
            content: `
    Solve the following problem by explaining the solution steps, then provide the final answer.

    A train travels 80 km/h for 3 hours.
    How far does it travel?
    `,
        },
    ],
})

console.log(response.choices[0]?.message?.content ?? "")
