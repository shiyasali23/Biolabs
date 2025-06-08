const INTELLIGENCE_API_URL = "http://127.0.0.1:8003/intelligence";

// List of intro phrases a user might say
const INTRO_INPUTS = ["hi", "hello", "hey"];

// List of possible replies to any of the intro inputs
const INTRO_REPLIES = [
  "Hi, How can i help you?",
  "Hey! What's on your mind?",
];

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
  console.log("Sending inference request with data:", inputData);

  let token = null;

  try {
    token = localStorage.getItem("token");
  } catch (error) {
    console.warn("localStorage not available:", error);
  }

  const query = (inputData?.text ?? "").toString().trim().toLowerCase();

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
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 404) {
        return {
          response: "Topic is out of scope",
          message: null,
        };
      }

      // Handle other HTTP errors
      return {
        response: result.error || "Something went wrong",
        message: result.message || null,
      };
    }

    // Handle successful response
    return {
      response: result.response,
      message: null,
    };
  } catch (error) {
    console.error("Inference request failed:", error);
    return {
      response: "Something went wrong",
      message: "Please try again later",
    };
  }
};
