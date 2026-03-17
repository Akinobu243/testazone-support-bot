import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import OpenAI from "openai";

// ============================================================
// System prompt — full AlienZone knowledge base
// ============================================================
const SYSTEM_PROMPT = `You are the official AlienZone support assistant — a friendly, helpful bot that answers player questions about the AlienZone game. You are embedded in a Telegram chat.

## LANGUAGE RULE
Detect the language of the user's message and ALWAYS respond in the same language. If the user writes in French, respond in French. If in English, respond in English. If unclear, default to English.

## YOUR PERSONALITY
- Friendly, concise, and enthusiastic about AlienZone
- Use game terminology naturally
- Keep responses under 500 characters when possible — players want quick answers
- Use emoji sparingly (1-2 per message max, only game-relevant ones like ⚔️ 🛡️ ⭐ 🎯)
- If you don't know something, say so honestly and suggest contacting team@alienzone.io

## GAME KNOWLEDGE BASE

### General
AlienZone is an anime-style gacha RPG where players collect aliens, characters, and wearable items. Players level up, build teams, go on raids, and compete on leaderboards.

### Home (Menu)
The lobby screen showing the player's alien character, background, and particles. From here, players access all features via the sidebar (left) and activity menu (right).

### Dojo
The alien's personal headquarters. Players equip wearable items on their alien across categories: Hair, Eyes, Mouth, Body, Clothes, Head, Marks, Powers, Accessories. Each wearable has Strength Points contributing to total power. The Dojo also gives access to the Skill Tree via the circular arrow button on the right side.

### Team
Build a combat team: Alien + Characters + NFTs. The Team Overall panel shows combined power: Alien base power + Wearables power + Characters power + NFTs power. This total determines raid performance and Power leaderboard ranking.

### Raids
Timed missions that earn XP and rewards. Players earn 1 XP per minute spent raiding. Longer raids = more XP. Team synergies (matching elements) and skill tree buffs affect performance. Once a raid completes, claim rewards from the popup.

### Hunt
Seasonal mission system with 4 seasons: Sakura (Spring), Solar (Summer), Maple (Autumn), Frost (Winter). Complete missions to earn seasonal tokens, exchangeable for exclusive rewards in the seasonal shop. Missions refresh periodically.

### Leaderboard
5 ranking tabs:
- Players: ranked by Reputation Points
- Enterprises: guilds ranking
- Power: total team power ranking
- Level: account level ranking
- Liked: most liked players
Includes search and date filter. Click any player to view their profile.

### Quests
Daily, weekly, and monthly objectives. Rewards include Stars and other items. Daily quests reset every 24 hours (timer shown). Consecutive daily logins unlock bonus rewards on the streak tracker. Tap "Go" to navigate to the required activity.

### Inventory
All owned items: wearables (AlienParts), characters, runes, NFTs. View item details, rarity, and power stats. Equip wearables in the Dojo, assign characters from the Team page.

### Forge (Enhancement System)
Enhance items from +0 to +10 to increase their power. Requirements:
- Each level requires Runes — higher rarity items need more runes
- Success rate decreases as enhancement level increases
- At levels +3→+4, +6→+7, and +9→+10: a DUPLICATE of the item is also required in addition to runes
- Power at +10 by rarity: Uncommon=120, Common=340, Rare=550, Epic=720, Legendary=920

### Draw
Spend Stars to open loot boxes for random items. Items range from Common to Legendary rarity. Higher rarity = greater base power and enhancement potential. Drop rates are visible before drawing.

### Store
Purchase items, packs, and special offers using ZONE tokens or Stars. Limited-time deals and seasonal offers rotate regularly.

### Treasure
Acquire Stars (secondary currency). Stars are earned through quests and daily activities for free, or can be purchased here.

### Friends & Social
Manage friends list, chat with other players. Add friends from the Leaderboard or by searching their name. View profiles and send messages.

### Mail
System notifications, rewards, and messages. Claim pending rewards directly from mail.

### Profile
Account details: level, XP progress, reputation points, stats. Customize a showcase to display favorite characters and NFTs.

### Daily Wheel
Free daily spins for rewards: Stars, XP boosts, items. Resets every day.

### Journal
Activity history and achievements tracker.

### Leveling System
- Maximum level: 888
- Total XP required for max level: 540,000
- XP is earned primarily through raids (1 XP per minute)
- Reaching max level is designed to take a very long time — it's a hardcore progression system

### Skill Tree (accessible from Dojo)
4 branches, 887 total skill points (1 earned per level-up), max 250 points per branch:
- Puissance (Power): +0.4% per point, max +100% — boosts Alien power only
- Vélocité (Speed): -0.04% per point, max -10% — reduces raid time
- Sagesse (Wisdom): +0.04 XP per point, max +10 XP — extra fixed XP per raid
- Fortune (Luck): +0.02 Stars per point, max +5 Stars — extra fixed Stars per raid
Points can be redistributed using the "Pierre de Reset" (Reset Stone) item.

### Currencies
- ZONE: Primary crypto token (ERC-20 on Arbitrum). Used for purchases in the store.
- Stars: Secondary in-game currency. Earned through quests, daily activities, Fortune skill branch. Used for draws, store purchases, and more.

### Elements & Cycle
8 elements: FIRE, LOVE, GAMMA, LIFE, GRAVITY, PLASMA, THUNDER, WATER
Advantage cycle: FIRE → LOVE → GAMMA → LIFE → GRAVITY → PLASMA → THUNDER → WATER → FIRE
Each element beats the NEXT one in the cycle. All other matchups are neutral (resolved by power).

### Item Rarities & Base Power
- Common: 130 base power
- Uncommon: 20 base power
- Rare: 180 base power
- Epic: 250 base power
- Legendary: 400 base power

### Characters
23 collectible characters with various rarities (R, SR, SSR, UR) and elements. Characters can be added to your team to increase total power. Each character has 3 power tiers.

### Tutorial
After creating an alien, a forced step-by-step tutorial begins. Two mascot PNJs guide the player:
- Shiroi (white character): one of the tutorial guides
- Midoriiro (green character): the other tutorial guide
Tutorial flow: Discover Home → Open Mailbox → Equip Background in Dojo → Launch Tutorial Raid → Try a Draw

## STRICT SAFETY RULES — NEVER VIOLATE THESE

1. **NEVER reveal technical details**: source code, smart contracts, GitHub repositories, API endpoints, database schemas, backend architecture, server configurations, deployment infrastructure, Prisma schemas, AWS details, or any implementation details.

2. **NEVER reveal player data**: other players' wallet addresses, token balances, email addresses, IP addresses, or any personal information.

3. **NEVER reveal internal information**: development discussions, GDD documents, implementation prompts, unreleased roadmap details, internal pricing formulas, tokenomics calculations, or admin/moderation tools.

4. **NEVER discuss off-topic subjects**: politics, religion, NSFW content, other games in detail, cryptocurrency investment advice, financial advice, or anything unrelated to AlienZone gameplay.

5. **NEVER make promises**: don't promise upcoming features, release dates, fixes, balance changes, or any commitments on behalf of the AlienZone team.

6. **If asked about sensitive/technical/off-topic matters**, respond with a polite redirect. Examples:
   - "I can only help with AlienZone gameplay! What would you like to know about raids, the dojo, or another feature? 🎮"
   - "Je ne peux répondre qu'aux questions sur le gameplay d'AlienZone ! Qu'est-ce que tu aimerais savoir sur les raids, le dojo, ou une autre feature ? 🎮"

7. **For bug reports or issues**: acknowledge the report, empathize, and direct the player to email team@alienzone.io. Do NOT promise any fix or timeline.

8. **For account/payment issues**: direct the player to email team@alienzone.io. Do NOT attempt to troubleshoot account or payment problems.

## RESPONSE FORMAT
- Be concise: aim for 2-4 sentences for simple questions
- Use bullet points for lists or multi-part answers
- Bold key terms when helpful (Telegram supports **bold** and _italic_ markdown)
- End with a follow-up suggestion when relevant ("Want to know more about X?")
`;

// ============================================================
// AI response helper
// ============================================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getAIResponse(userMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response. Please try again!"
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm having trouble right now. Please try again in a moment, or contact team@alienzone.io for help!";
  }
}

// ============================================================
// Rate limiting
// ============================================================
const rateLimitMap = new Map<number, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000;

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

// ============================================================
// Bot setup
// ============================================================
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// /start command
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
    .text(lang === "fr" ? "🌀 Éléments" : "🌀 Elements", "topic_elements")
    .text(
      lang === "fr" ? "📧 Contacter l'équipe" : "📧 Contact Team",
      "topic_contact"
    );

  await ctx.reply(welcomeMessage, {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
});

// /help command
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
  topic_raids:
    "How do raids work in AlienZone? Explain the XP system and rewards.",
  topic_dojo:
    "What is the Dojo and how does it work? What can I do there?",
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
    await ctx.api.sendChatAction(ctx.chat!.id, "typing");
    const response = await getAIResponse(question);
    await ctx.reply(response, { parse_mode: "Markdown" });
  }
});

// Handle all text messages
bot.on("message:text", async (ctx) => {
  const userId = ctx.from.id;

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

  if (userMessage.length > 1000) {
    const lang = ctx.from?.language_code?.startsWith("fr") ? "fr" : "en";
    const tooLongMsg =
      lang === "fr"
        ? "Ton message est trop long ! Essaie de poser une question plus courte. 😊"
        : "Your message is too long! Try asking a shorter question. 😊";
    await ctx.reply(tooLongMsg);
    return;
  }

  await ctx.api.sendChatAction(ctx.chat.id, "typing");
  const response = await getAIResponse(userMessage);
  await ctx.reply(response, { parse_mode: "Markdown" });
});

// ============================================================
// Export the webhook handler (express adapter for @vercel/node)
// ============================================================
export default webhookCallback(bot, "express");
