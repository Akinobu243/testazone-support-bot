# AlienZone Support Bot

Official Telegram support bot for AlienZone — an anime-style gacha RPG.

Powered by GPT-4o-mini, hosted on Vercel as a serverless function.

## Features

- 🌐 Bilingual (French / English) — auto-detects user language
- 🎮 Answers gameplay questions (raids, dojo, skill tree, forge, etc.)
- 🔒 Strict safety guardrails — never reveals sensitive data
- ⚡ Quick-action buttons for common topics
- 🛡️ Rate limiting (20 msg/min/user)

## Setup

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather)
2. Get an [OpenAI API key](https://platform.openai.com/api-keys)
3. Deploy to Vercel with env vars:
   - `TELEGRAM_BOT_TOKEN`
   - `OPENAI_API_KEY`
4. Register the webhook:
   ```bash
   TELEGRAM_BOT_TOKEN=xxx VERCEL_URL=your-project.vercel.app node scripts/set-webhook.js
   ```

## Stack

- Node.js 18+, TypeScript
- [grammy](https://grammy.dev/) — Telegram Bot API
- [OpenAI SDK](https://github.com/openai/openai-node) — GPT-4o-mini
- Vercel Serverless Functions (webhook mode)
