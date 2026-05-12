import { model } from "./model.js";
import { extractionSchema } from "./schema.js";
async function main() {
    const text = `
    Langchain uses tools.
    Langgraph uses Langchain.
    RAG uses embeddings.
    `;
    // basically here we defined the schema and data, then pass it to the LLM 
    // and then the llm converts the data into that specific schema
    const prompt = `Extract relationships from the text.

Return ONLY valid JSON.

Format:
[
  {
    "source": "...",
    "relationship": "...",
    "target": "..."
  }
]

Text:
${text}
   `;
    const response = await model.invoke(prompt);
    // after that we need to validate the data
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    console.log("\nRaw Output:\n");
    console.log(content);
    // then we try to parse the data 
    try {
        const parse = JSON.parse(content);
        const validated = extractionSchema.parse(parse);
        console.log(validated);
    }
    catch (error) {
        console.log("Parsing validation error:", error);
    }
}
main();
