import "dotenv/config"
import readline from "readline/promises";
import { ChatGroq } from "@langchain/groq"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// const answer = await rl.question("What is your name? ");
// console.log(`Hello, ${answer}!`);
// rl.close();


const messages = []

const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: 4096,
    maxRetries: 2,
})

while (true) {
  const userInput = await rl.question("\x1b[32mYou:\x1b[0m ");
  if(userInput.toLowerCase() === "exit") {
    console.log("\x1b[32mBye!\x1b[0m");
    rl.close();
    break;
  }
    messages.push({ role: "user", content: userInput });
    const response = await model.invoke(messages);
    messages.push({ role: "assistant", content: response.text });
    console.log("\x1b[32mAI:\x1b[0m ", response.text);
}

