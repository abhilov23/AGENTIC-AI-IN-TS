import { createSession, closeDriver } from "./graph.js";
import { model } from "./model.js";


async function main() {

    const quesition = "what does langchain use?";
    const session = createSession();
    const result = await session.run(
         `
      MATCH (a:Entity)-[r]->(b:Entity)
      WHERE a.name = $name
      RETURN a.name AS source,
             r.type AS relationship,
             b.name AS target
      `,{
        name:"Langchain" // replace this with the name of the entity you want to query
      }
    );
     const records = result.records.map((record) => ({
      source: record.get("source"),
      relationship: record.get("relationship"),
      target: record.get("target"),
    }));

     const context = records
      .map(
        (r) =>
          `${r.source} ${r.relationship} ${r.target}`
      )
      .join("\n");
     
      const prompt = `
      You are a helpful AI assistant.
      
      Answer the user's question using ONLY the provided context.
      
       Context:
       ${context}
       
       Question:
       ${quesition}
      `

    const response = await model.invoke(prompt);
    console.log(response.content);
    await session.close();
    await closeDriver();
}

main()