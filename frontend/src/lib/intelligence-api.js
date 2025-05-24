const INTELLIGENCE_API_URL = 'https://intelligence.biolabsltd.com';

// List of intro phrases a user might say
const INTRO_INPUTS = [
  "hi", "hello", "hey",
  "good morning", "good afternoon", "good evening",
  "how are you", "what can you do", "who are you"
];

// List of possible replies to any of the intro inputs
const INTRO_REPLIES = [
  "Hello there!",
  "Hey! How are you?",
  "Hey! What's on your mind?",
  "Good to see you! What can I help with?",
  "Hi! Ready to dive into your health journey?",
  "Hey there! Let’s make health simple today.",
  "Welcome! I'm here to support your wellness."
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

  const query = inputData?.query?.trim().toLowerCase();

  if (query && INTRO_INPUTS.includes(query)) {
    return {
      message: null,
      data: {
        generated_text: getRandomIntroReply(),
        query: inputData.query,
        document: inputData.document || [],
        relevant_files: inputData.relevant_files || [],
        biometrics: inputData.biometrics || [],
        mode: inputData.mode || "sample"
      },
      isRelevant: true
    };
  }

  // Proceed with API call if not an instant intro reply
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
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 400 && result.error === "Query is not relevant.") {
      return {
        message: "Please ask health-related questions only.",
        data: null,
        isRelevant: false
      };
    }

    if (result.status === 200 && result.response) {
      return {
        message: null,
        data: result.response,
        isRelevant: true
      };
    }

    return {
      message: "Unexpected response format.",
      data: null,
      isRelevant: false
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        message: "Request was cancelled.",
        data: null,
        isRelevant: false
      };
    }

    console.error("Intelligence API error:", error.message);
    return {
      message: "Something went wrong. Please try again.",
      data: null,
      isRelevant: false
    };
  }
};
