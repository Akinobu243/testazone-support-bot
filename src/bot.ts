import { Bot, InlineKeyboard } from "grammy";
import { getAIResponse } from "./ai";

// Rate limiting: simple in-memory map (resets on cold start — fine for serverless)
const rateLimitMap = new Map<
  number,
  { count: number; resetAt: number }
>();
const RATE_LIMIT = 20; // messages per minute
const RATE_WINDOW = 60_000; // 1 minute in ms

function isRateLimited(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export function createBot(): Bot {
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

  // /start command — welcome message with quick-action buttons
  bot.command("start", async (ctx) => {
    const lang = ctx.from?.language_code?.startsWith("fr") ? "fr" : "en";

    const welcomeMessage =
      lang === "fr"
        ? `🛸 *Bienvenue sur le Support AlienZone !*

Je suis l'assistant officiel d'AlienZone. Pose-moi n'importe quelle question sur le jeu et je ferai de mon mieux pour t'aider !

Tu peux aussi utiliser les boutons ci-dessous pour des réponses rapides.`
        : `🛸 *Welcome to AlienZone Support!*

I'm the official AlienZone assistant. Ask me anything about the game and I'll do my best to help!

You can also use the buttons below for quick answers.`;

    const keyboard = new InlineKeyboard()
      .text(lang === "fr" ? "⚔️ Raids" : "⚔️ Raids", "topic_raids")
      .text(lang === "fr" ? "🏯 Dojo" : "🏯 Dojo", "topic_dojo")
      .row()
      .text(
        lang === "fr" ? "🌳 Arbre de compétences" : "🌳 Skill Tree",
        "topic_skilltree"
      )
      .text(lang === "fr" ? "🔨 Forge" : "🔨 Forge", "topic_forge")
      .row()
      .text(
        lang === "fr" ? "📊 Classement" : "📊 Leaderboard",
        "topic_leaderboard"
      )
      .text(lang === "fr" ? "🎯 Quêtes" : "🎯 Quests", "topic_quests")
      .row()
      .text(
        lang === "fr" ? "🌀 Éléments" : "🌀 Elements",
        "topic_elements"
      )
      .text(
        lang === "fr" ? "📧 Contacter l'équipe" : "📧 Contact Team",
        "topic_contact"
      );

    await ctx.reply(welcomeMessage, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  });

  // /help command — same as start
  bot.command("help", async (ctx) => {
    const lang = ctx.from?.language_code?.startsWith("fr") ? "fr" : "en";

    const helpMessage =
      lang === "fr"
        ? `🎮 *Commandes disponibles :*

/start — Message de bienvenue avec boutons rapides
/help — Afficher cette aide

Ou pose-moi directement ta question sur le gameplay !`
        : `🎮 *Available commands:*

/start — Welcome message with quick buttons
/help — Show this help

Or just ask me any gameplay question directly!`;

    await ctx.reply(helpMessage, { parse_mode: "Markdown" });
  });

  // Callback queries for quick-action buttons
  const topicQuestions: Record<string, string> = {
    topic_raids: "How do raids work in AlienZone? Explain the XP system and rewards.",
    topic_dojo: "What is the Dojo and how does it work? What can I do there?",
    topic_skilltree:
      "Explain the skill tree system in detail — the 4 branches, points, and caps.",
    topic_forge:
      "How does the enhancement/forge system work? Explain runes, success rates, and duplicates.",
    topic_leaderboard:
      "What are the different leaderboard tabs and how is ranking determined?",
    topic_quests:
      "How do quests work? Daily, weekly, monthly — explain the reward system.",
    topic_elements:
      "What is the element advantage cycle? List all 8 elements and the cycle order.",
    topic_contact: "CONTACT_TEAM",
  };

  bot.on("callback_query:data", async (ctx) => {
    const topic = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();

    if (topic === "topic_contact") {
      const lang = ctx.from?.language_code?.startsWith("fr") ? "fr" : "en";
      const contactMsg =
        lang === "fr"
          ? "📧 Pour les problèmes de compte, bugs, ou questions hors gameplay, contacte l'équipe : *team@alienzone.io*"
          : "📧 For account issues, bugs, or non-gameplay questions, contact the team: *team@alienzone.io*";
      await ctx.reply(contactMsg, { parse_mode: "Markdown" });
      return;
    }

    const question = topicQuestions[topic];
    if (question) {
      // Send typing indicator while AI processes
      await ctx.api.sendChatAction(ctx.chat!.id, "typing");
      const response = await getAIResponse(question);
      await ctx.reply(response, { parse_mode: "Markdown" });
    }
  });

  // Handle all text messages
  bot.on("message:text", async (ctx) => {
    const userId = ctx.from.id;

    // Rate limiting
    if (isRateLimited(userId)) {
      const lang = ctx.from?.language_code?.startsWith("fr") ? "fr" : "en";
      const limitMsg =
        lang === "fr"
          ? "⏳ Tu envoies trop de messages. Attends un moment avant de réessayer."
          : "⏳ You're sending too many messages. Please wait a moment before trying again.";
      await ctx.reply(limitMsg);
      return;
    }

    const userMessage = ctx.message.text;

    // Skip if message is too long (potential abuse)
    if (userMessage.length > 1000) {
      const lang = ctx.from?.language_code?.startsWith("fr") ? "fr" : "en";
      const tooLongMsg =
        lang === "fr"
          ? "Ton message est trop long ! Essaie de poser une question plus courte. 😊"
          : "Your message is too long! Try asking a shorter question. 😊";
      await ctx.reply(tooLongMsg);
      return;
    }

    // Send typing indicator while AI processes
    await ctx.api.sendChatAction(ctx.chat.id, "typing");

    // Get AI response
    const response = await getAIResponse(userMessage);
    await ctx.reply(response, { parse_mode: "Markdown" });
  });

  return bot;
}
