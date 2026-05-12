import { model } from "./model.js";
async function main() {
    const request = await model.invoke("hello, what is RAG in gererative ai?");
    console.log(request.content);
}
main();
//# sourceMappingURL=index.js.map