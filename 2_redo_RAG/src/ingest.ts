import "dotenv/config";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Document } from "@langchain/core/documents";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import  embeddings  from "./embeddings.js";
import { env } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");



async function loadtextDocs(dir: string): Promise<Document[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const docs: Document[] = [];

    for (const entry of entries) {
        if (!entry.isFile()) continue;

        const ext = path.extname(entry.name).toLowerCase();
        if (ext !== ".txt" && ext !== ".md") continue;

        const filePath = path.join(dir, entry.name);
        const content = await readFile(filePath, "utf8");
        docs.push(new Document({ pageContent: content, metadata: { source: filePath } }));
    }

    return docs;

}


async function main(){
    const notesDir = path.resolve(PROJECT_ROOT, "notes");
    const docs = await loadtextDocs(notesDir);

    if (docs.length === 0) {
        throw new Error(`No .txt or .md files found in: ${notesDir}`);
    }

    console.log("Loaded docs:", docs.length);
    
    // splitting the charactors
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });
    
    const splitDocs = await splitter.splitDocuments(docs);
    console.log("Chunks:", splitDocs);

    console.log("Chunks:", splitDocs.length);

    await Chroma.fromDocuments(
        splitDocs,
        embeddings,
        {
            collectionName: "notes",
            url: env.CHROMA_URL,
        }
    );

    console.log("Vector DB created");

}

main()
