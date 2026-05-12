import { model } from "./model.js";
import { createSession, closeDriver } from "./graph.js";

async function main() {
  const question = "What does LangGraph extend?";

  // here it extracts the main entity from the question
  const entityPrompt = `
Extract the main entity from the question.

Return ONLY the entity name.

Question:
${question}
`;
  
  const entityResponse = await model.invoke(entityPrompt);

  const entity =
    typeof entityResponse.content === "string"
      ? entityResponse.content.replace(/^["'\s]+|["'\s]+$/g, "").trim()
      : "";

  console.log("\nDetected Entity:\n");

  console.log(entity);
 
  // starting the session to look for the entity
  const session = createSession();

  try {

    const result = await session.run(
      `
      MATCH (a:Entity)-[r]->(b:Entity)
      WHERE toLower(a.name) = toLower($name)
      RETURN a.name AS source,
             r.type AS relationship,
             b.name AS target
      `,
      {
        name: entity,
      }
    );
    
    // mapping the results 
    const records = result.records.map((record) => ({
      source: record.get("source"),
      relationship: record.get("relationship"),
      target: record.get("target"),
    }));

    console.log("\nRetrieved Graph Data:\n");

    console.log(records);

    if (records.length === 0) {
      console.log("\nNo graph matches found for the detected entity. Run extraction first or check entity naming.");
      return;
    }
    
    // creating the context 
    const context = records
      .map(
        (r) =>
          `${r.source} ${r.relationship} ${r.target}`
      )
      .join("\n");
    
      // asking for the question
    const prompt = `
You are a helpful AI assistant.

Answer the question using ONLY the graph context below.

Graph Context:
${context}

Question:
${question}
`;

    const response = await model.invoke(prompt);

    console.log("\nAI Answer:\n");

    console.log(response.content);
  } finally {
    await session.close();
    await closeDriver();
  }
}

main();
