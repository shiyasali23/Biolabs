"use client";

import React, { useEffect, useRef, useState } from "react";

const ChatSection = ({ chatArray = [], isLoading = false }) => {
  const bottomRef = useRef(null);
  const [animatedMessages, setAnimatedMessages] = useState(new Set());
  const [completedAnimations, setCompletedAnimations] = useState(new Set());
  const prevChatLengthRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    // Only mark new messages for animation when chatArray actually grows
    if (chatArray.length > prevChatLengthRef.current) {
      const lastMessage = chatArray[chatArray.length - 1];
      if (lastMessage.response) {
        const messageId = `${chatArray.length - 1}-${lastMessage.response}`;
        setAnimatedMessages((prev) => new Set([...prev, messageId]));
      }
      prevChatLengthRef.current = chatArray.length;
    }
  }, [chatArray]);

  const AnimatedText = ({ text, shouldAnimate, messageId }) => {
    const [displayed, setDisplayed] = useState(shouldAnimate ? "" : text);
    const [isAnimating, setIsAnimating] = useState(shouldAnimate);
    const indexRef = useRef(0);

    useEffect(() => {
      if (!shouldAnimate) return;

      // Prepare text with first letter uppercased
      const fixedText = text.charAt(0).toUpperCase() + text.slice(1);

      indexRef.current = 0;
      setDisplayed("");
      setIsAnimating(true);

      const tick = () => {
        if (indexRef.current < fixedText.length) {
          setDisplayed(fixedText.slice(0, indexRef.current + 1));
          indexRef.current += 1;
          requestAnimationFrame(tick);
        } else {
          setIsAnimating(false);
          setCompletedAnimations((prev) => new Set([...prev, messageId]));
        }
      };

      requestAnimationFrame(tick);
    }, [text, shouldAnimate, messageId]);

    return (
      <span>
        {displayed}
        {isAnimating && displayed.length < text.length && (
          <span className="w-0.5 h-4 bg-gray-600 ml-0.5 animate-pulse inline-block" />
        )}
      </span>
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-4 scroll-smooth flex- flex-col space-y-7">
      {chatArray.map((chat, i) => {
        const messageId = `${i}-${chat.response || ""}`;
        // Only animate if it's in animatedMessages AND not completed AND is the last message
        const shouldAnimate =
          chat.response &&
          animatedMessages.has(messageId) &&
          !completedAnimations.has(messageId);

        return (
          <div key={i} className="w-full space-y-2">
            {chat.promt && (
              <div className="w-full flex justify-end">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-blue-100 text-blue-800 rounded-br-sm text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {chat.promt}
                </div>
              </div>
            )}

            {chat.response && (
              <div className="w-full flex justify-start">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-sm text-sm leading-relaxed whitespace-pre-wrap break-words">
                  <AnimatedText
                    text={chat.response || ""}
                    shouldAnimate={shouldAnimate}
                    messageId={messageId}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
      {isLoading && (
        <div className="w-full flex justify-start">
          <span className="text-gray-600 font-medium">Thinking</span>
          <div className="flex space-x-1 items-center justify-center ml-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.45s]" />
            <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatSection;
