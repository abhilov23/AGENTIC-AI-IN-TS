import { createSession, closeDriver } from "./graph.js";
async function main() {
    const session = createSession();
    const result = await session.run(`
      MATCH (a:Entity)-[r]->(b:Entity)
      WHERE a.name = $name
      RETURN a.name AS source,
             r.type AS relationship,
             b.name AS target
      `, {
        name: "Langchain" // replace this with the name of the entity you want to query
    });
    console.log(result.records);
    await closeDriver();
}
main();
