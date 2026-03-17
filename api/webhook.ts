import { webhookCallback } from "grammy";
import { createBot } from "../src/bot";

// Create bot instance
const bot = createBot();

// Use the express adapter — compatible with @vercel/node (req, res)
export default webhookCallback(bot, "express");
