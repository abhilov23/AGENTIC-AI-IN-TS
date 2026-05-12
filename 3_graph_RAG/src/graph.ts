import "dotenv/config";
import { z } from "zod";
import neo4j from "neo4j-driver";

const envSchema = z.object({
    NEO4J_URI: z.string().min(1),
    NEO4J_USER: z.string().min(1),
    NEO4J_PASSWORD: z.string().min(1),
});

const env = envSchema.parse(process.env);

const driver = neo4j.driver(
    env.NEO4J_URI,
    neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD)
);

export function createSession() {
    return driver.session();
}

export async function closeDriver() {
    await driver.close();
}
