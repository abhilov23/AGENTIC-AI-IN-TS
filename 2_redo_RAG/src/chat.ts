import  embeddings  from './embeddings.js';
import "dotenv/config";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { model } from './model.js';


async function main(){
  const vectorStore = new Chroma(
    embeddings,
    {
      collectionName: "notes",
    }
  );
  
  const question = "What are the basic commands of typescript?";
  
      const retriever = vectorStore.asRetriever({
        k:2
    })
   
    const relevantDocs = await retriever.invoke(question);
    
    console.log(relevantDocs)
    
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");
    
    const prompt = `
    You are a helpful AI assistant.
    
    Answer the user's question using ONLY the provided context.
    
     Context:
     ${context}
     
     Question:
     ${question}
      `
    const response = await model.invoke(prompt);
    
    console.log(response.content)

}
main()