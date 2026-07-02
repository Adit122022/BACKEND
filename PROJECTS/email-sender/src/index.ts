import "dotenv/config";
import readline from "readline/promises";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { sendEmail } from "./mail.service.js";
import * as z from "zod";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const emailTool = tool(sendEmail, {
  name: "send_email",
  description: "Send an email to a recipient with a subject and message",
  schema: z.object({
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    html: z.string().describe("HTML content of the email"),
  }),
});
const messagesInterFace: {
  role: string;
  content: any;
}[] = [];

const messages = [];

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxTokens: 4096,
  maxRetries: 2,
});

const agent = createReactAgent({
  llm: model,
  tools: [emailTool],
});

while (true) {
  const userInput = await rl.question("\x1b[32mYou:\x1b[0m ");
  if (userInput.toLowerCase() === "exit") {
    console.log("\x1b[32mBye!\x1b[0m");
    rl.close();
    break;
  }
  messages.push({ role: "user", content: userInput });
  const response = await agent.invoke({ messages });
  
  // Synchronize local messages history with the agent's updated state
  messages.length = 0;
  messages.push(...response.messages);

  const lastMessage = response.messages[response.messages.length - 1];
  if (lastMessage) {
    console.log("\x1b[32mAI:\x1b[0m ", lastMessage.content);
  }
}
