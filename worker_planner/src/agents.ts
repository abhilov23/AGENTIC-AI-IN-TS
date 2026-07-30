import {
  Agent,
  run,
  setDefaultOpenAIClient,
  setOpenAIAPI,
  setTracingDisabled,
} from "@openai/agents";
import OpenAI from "openai";
import { Context } from "hono";
import { z } from "zod";
import { webSearch } from "./tools";
import "dotenv/config";


const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: process.env.NVIDIA_BASE_URL!,
});

setDefaultOpenAIClient(client);
setOpenAIAPI("chat_completions");
setTracingDisabled(true);

const plannerAgent = new Agent({
  name: "Planner",

  instructions: `
You are a project planner.

Break the user's request into independent tasks.

Return ONLY valid JSON.

Example:

[
  {
    "workerName":"Frontend",
    "task":"Build the React UI"
  },
  {
    "workerName":"Backend",
    "task":"Build Express API"
  }
]
`,

  model: process.env.NVIDIA_MODEL!,
  tools: [webSearch],
});

const synthesizer = new Agent({
  name: "Synthesizer",

  instructions: `
You are the lead engineer.

Merge every worker's output into one final response.

Resolve conflicts.

Return one coherent answer.
`,

  model: process.env.NVIDIA_MODEL!,
  tools: [webSearch],
});

const TaskSchema = z.array(
  z.object({
    workerName: z.string(),
    task: z.string(),
  })
);

type WorkerOutput = {
  worker: string;
  task: string;
  result: string;
};

export async function planAndExecute(c: Context) {
  const { question } = await c.req.json();


  const planner = await run(plannerAgent, question);

  const tasks = TaskSchema.parse(
    JSON.parse(planner.finalOutput as string)
  );

  const workspace = {
    userRequest: question,
    outputs: [] as WorkerOutput[],
  };


  const ROUNDS = 2;

  for (let round = 1; round <= ROUNDS; round++) {
    console.log(`Round ${round}`);

    const roundResults = await Promise.all(
      tasks.map(async (task) => {
        const previousWork = workspace.outputs
          .filter((x) => x.worker === task.workerName)
          .map((x) => x.result)
          .join("\n\n");

        const worker = new Agent({
          name: task.workerName,

          instructions: `
    You are the ${task.workerName} worker.

    Your ONLY responsibility:

    ${task.task}

    Current shared workspace:

    ${JSON.stringify(workspace.outputs, null, 2)}

    Your previous work:

    ${previousWork}

    Rules:

- Read everyone's work.
- Improve your own work.
- Avoid duplicate work.
- Build on top of other workers.
- Return ONLY your contribution.
`,

          model: process.env.NVIDIA_MODEL!,
          tools: [webSearch],
        });

        const result = await run(worker, task.task);

        return {
          worker: task.workerName,
          task: task.task,
          result: result.finalOutput as string,
        };
      })
    );

    workspace.outputs = roundResults;
  }


  const final = await run(
    synthesizer,
       `
       User request:

       ${question}

       Worker outputs:

       ${JSON.stringify(workspace.outputs, null, 2)}
       `
  );

  return c.json({
    planner: tasks,
    workers: workspace.outputs,
    final: final.finalOutput,
  });
}