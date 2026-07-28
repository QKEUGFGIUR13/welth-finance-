import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Single place that knows which Gemini model to use.
 *
 * Google retires dated model names (gemini-1.5-flash started returning 404),
 * so we default to the "latest" alias and allow an override via GEMINI_MODEL.
 */
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiModel() {
  return genAI.getGenerativeModel({ model: MODEL });
}
