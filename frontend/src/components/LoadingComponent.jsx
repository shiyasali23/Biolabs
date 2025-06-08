import React, { useState, useEffect } from "react";

const loadingMessages = [
  { text: "Eat food, dance medicine — just don't skip your medicine!" },
  { text: "Ayurveda says: Heal from within.", author: "Tanu" },
  { text: "It’s all about managing time… or is it?" },
  { text: "Taking care of yourself is also productive." },
  { text: "A calm mind is a powerful mind.", author: "Unknown" },
  { text: "Breathe in clarity, breathe out stress." },
  { text: "Every moment counts. Make it meaningful.", author: "Rumi" },
  { text: "Let curiosity guide your day." },
  { text: "Even superheroes need rest. So do you!" },
  { text: "Balance isn't something you find, it's something you create." },
  { text: "When was the last time you truly relaxed?" },
  { text: "Have you drunk enough water today?" },
  { text: "What's one thing you're grateful for right now?" },
  { text: "If your body could talk, what would it say?" },
  { text: "What's more important today: speed or intention?" },
  { text: "Are you nourishing your mind or just feeding it?" },
  { text: "What does wellness mean to you?" },
  { text: "Could a short walk change how you feel right now?" },
  { text: "What’s the kindest thing you’ve done for yourself this week?" },
  { text: "Ever tried replacing coffee with a nap?" }
];

function getRandomMessage() {
  return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
}

const LoadingComponent = () => {
  const [message, setMessage] = useState(() => getRandomMessage());

  // Optional: if you want to rotate messages every few seconds
  // useEffect(() => {
  //   const interval = setInterval(() => setMessage(getRandomMessage()), 5000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-4 px-6 text-center">
      <h2 className="text-2xl font-bold text-gray-700">{message.text}</h2>
      {message.author && <p className="text-sm text-gray-500">— {message.author}</p>}
      <div className="flex space-x-2 pt-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce [animation-delay:0.15s]"></div>
      </div>
    </div>
  );
};

export default LoadingComponent;
