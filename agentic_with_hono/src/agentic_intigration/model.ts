import OpenAI from "openai";
import "dotenv/config";
import { Context } from "hono";
import { streamText } from "hono/streaming";

const modelEnv = process.env.NVIDIA_MODEL;

if (!modelEnv) {
    throw new Error("NVIDIA_MODEL is not set");
}

const model: string = modelEnv;

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: process.env.NVIDIA_BASE_URL,
  });  


export default async function callOpenAIWithHono(c: Context) { 
     
    const {question} = await c.req.json<{
        question: string;
    }>();
    if(!question) {
        return c.json({success:false, error: "Question is required"}, 400);
    }


    return streamText (c, async (stream) => {
        const response = await openai.chat.completions.create({
                    model,
                    stream: true,
                    messages:[
                       { 
                        role: "system",
                        content: question,
                        },
                    ],
                })

                for await (const chunk of response) {
                       const token = chunk.choices[0]?.delta?.content

                if (token) {
                  await stream.write(token)
                 }
                }
})

}
