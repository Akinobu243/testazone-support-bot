/**
 * Run this script ONCE after deploying to Vercel to register the webhook URL.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=xxx VERCEL_URL=your-project.vercel.app node scripts/set-webhook.js
 *
 * Or set the env vars in your shell first.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL;

if (!BOT_TOKEN) {
  console.error("Error: TELEGRAM_BOT_TOKEN is not set");
  process.exit(1);
}

if (!VERCEL_URL) {
  console.error("Error: VERCEL_URL is not set (e.g., your-project.vercel.app)");
  process.exit(1);
}

async function setWebhook() {
  const webhookUrl = `https://${VERCEL_URL}/api/webhook`;

  console.log(`Setting webhook to: ${webhookUrl}`);

  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    }
  );

  const data = await response.json();

  if (data.ok) {
    console.log("✅ Webhook set successfully!");
    console.log(`   URL: ${webhookUrl}`);
  } else {
    console.error("❌ Failed to set webhook:", data);
  }
}

setWebhook().catch(console.error);
