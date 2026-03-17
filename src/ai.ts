import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./system-prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAIResponse(userMessage: string): Promise<string> {
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
