import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ status: "ok", env_check: !!process.env.TELEGRAM_BOT_TOKEN });
  }

  // POST — just echo for now
  return res.status(200).json({ received: true, body_type: typeof req.body });
}
