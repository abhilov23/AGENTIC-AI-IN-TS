# LangChain

LangChain is a framework for building LLM-powered applications.

Key concepts:
- Chains
- Agents
- RAG
- Tools

- `npm install -g typescript` : to install typescript in the project: g means global.
- `tsc` : tsc command is for the typescript compiler.
- `tsc.cmd —init`  : to initialize a typescript project.
- you can also get the `nodeJS` or `ReactJS` packages for working with typescript.

- `tsc <filename.ts>` : to use typescript compiler. you can also use it as `tsc.cmd`  if you are getting errors.

- When we start working on the typescript  in the nodeJS and we compile it in tsc, it creates a JS file from that specific ts file as well.

 

- `npx ts-node xyz.ts` : you can directly execute typescript files using         ts-node.
- `npx ts-node`  : here you can directly access the typescript running env using this command.

- `tsc.cmd abc.ts -watch` : to use the watch mode, it **will watch a specific file  for any changes**. If any changes are made, it will automatically recompile. It will also inform about the syntax mistakes by itself.
- `tsc.cmd —watch`  : compile the whole typescript project while development. but before that you also need to initialize the project as a typescript project by using `tsc.cmd init`.

- you can also use `esrun` to execute typescript files. Using tsrun you can directly run the typescript.

[npm: @digitak/esrun](https://www.npmjs.com/package/@digitak/esrun)