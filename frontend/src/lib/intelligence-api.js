const INTELLIGENCE_API_URL = 'https://intelligence.biolabsltd.com';

// List of intro phrases a user might say
const INTRO_INPUTS = [
  "hi", "hello", "hey"
];

// List of possible replies to any of the intro inputs
const INTRO_REPLIES = [
  "Hello there!",
  "Hey! How are you?",
  "Hey! What's on your mind?",
];

// Session tracker to avoid repeating the same reply
let lastIntroReply = null;

function getRandomIntroReply() {
  const availableReplies = INTRO_REPLIES.filter(reply => reply !== lastIntroReply);
  const chosen = availableReplies[Math.floor(Math.random() * availableReplies.length)];
  lastIntroReply = chosen;
  return chosen;
}

export const inference = async (inputData, abortSignal = null) => {
  let token = null;

  try {
    token = localStorage.getItem("token");
  } catch (error) {
    console.warn("localStorage not available:", error);
  }

  const query = inputData?.text?.trim().toLowerCase();

  if (query && INTRO_INPUTS.includes(query)) {
    return { response: getRandomIntroReply(), message: null };
  }

  const payload = { ...inputData };
  if (token) {
    payload.token = token;
  }

  try {
    const response = await fetch(`${INTELLIGENCE_API_URL}/inference`, {
      method: "POST",
      body: JSON.stringify({ data: payload }),
      signal: abortSignal,
      headers: { 
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 204) {
      return { response: "Ask health related questions.", message: null };
    }

    if (result.response) {
      return { response: result.response, message: null };
    }

    return { response: "", message: "Something went wrong" };

  } catch (error) {
    console.error("Inference request failed:", error);
    return { response: "", message: "Something went wrong" };
  }
};
