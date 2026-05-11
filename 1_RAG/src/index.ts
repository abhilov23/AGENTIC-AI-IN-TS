import { model } from "./model.js";

async function main(){
    const response = await model.invoke("hello, what is RAG in gererative ai?")
    console.log(response.content)
}

main()