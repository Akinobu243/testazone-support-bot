import { webhookCallback } from "grammy";
import { createBot } from "../src/bot";

// Create bot instance
const bot = createBot();

// Export as Vercel serverless function
export default webhookCallback(bot, "std/http");
