import { request } from "./http.js";
import { cacheManager } from "@/utils/cache-wroker";

const INTELLIGENCE_API_URL = process.env.NEXT_PUBLIC_INTELLIGENCE_API_URL || "/intelligence";

// List of intro phrases a user might say
const INTRO_INPUTS = ["hi", "hello", "hey"];

// List of possible replies to any of the intro inputs
const INTRO_REPLIES = ["Hi, How can i help you?", "Hey! What's on your mind?"];

// Session tracker to avoid repeating the same reply
let lastIntroReply = null;

function getRandomIntroReply() {
  const availableReplies = INTRO_REPLIES.filter(
    (reply) => reply !== lastIntroReply
  );
  const chosen =
    availableReplies[Math.floor(Math.random() * availableReplies.length)];
  lastIntroReply = chosen;
  return chosen;
}

export const inference = async (inputData) => {
  const token = cacheManager.get("token");

  const query = (inputData?.text ?? "").toString().trim().toLowerCase();

  if (query && INTRO_INPUTS.includes(query)) {
    return { response: getRandomIntroReply(), message: null };
  }

  const payload = { ...inputData };
  if (token) {
    payload.token = token;
  }

  const result = await request(`${INTELLIGENCE_API_URL}/inference`, { method: "POST", json: { data: payload }, timeout: 60000 });
  if (result.error) {
    console.error("Inference request failed:", result.error);
    return { response: "Something went wrong", message: "Please try again later" };
  }
  if (result.status === 404) return { response: null, message: "Intelligence is unavailable for this request." };
  if (!result.ok) return { response: result.body?.error || "Something went wrong", message: result.body?.message || "The request failed. Please retry." };
  return { response: result.body?.response, message: null };
};
