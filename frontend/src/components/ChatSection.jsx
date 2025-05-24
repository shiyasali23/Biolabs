"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import ChatMessage from "./ChatMessage";
import LoadingComponent from "./LoadingComponent";

// Main Chat Section Component
const ChatSection = React.memo(({ chatArray = [], isLoading = false }) => {
  const bottomRef = useRef(null);
  const [animateLatest, setAnimateLatest] = useState(false);

  // Smooth scroll to bottom on new message or loading state
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatArray.length, isLoading, scrollToBottom]);

  // Trigger animation for the latest assistant response
  useEffect(() => {
    if (chatArray.length > 0) {
      setAnimateLatest(true);
      const timeout = setTimeout(() => setAnimateLatest(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [chatArray.length]);

  // Render chat messages with user and assistant styling
  const renderChatMessages = useCallback(() => (
    chatArray.map((chat, index) => {
      const isLatest = index === chatArray.length - 1;
      const shouldAnimate = animateLatest && isLatest && !chat.isInitial;

      return (
        <div key={index} className="w-full mb-4">
          {/* User message (translucent gray bubble) */}
          {chat.prompt && !chat.isInitial && (
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-200/70 text-gray-800 rounded-br-sm">
                <p className="text-sm whitespace-pre-wrap break-words">
                  {chat.prompt}
                </p>
              </div>
            </div>
          )}

          {/* Assistant message (plain text) */}
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-transparent text-gray-800 rounded-bl-sm">
              <p className="text-sm whitespace-pre-wrap break-words">
                {shouldAnimate
                  ? <ChatMessage message={chat.response} isAnimated />
                  : chat.response
                }
              </p>
            </div>
          </div>
        </div>
      );
    })
  ), [chatArray, animateLatest]);

  // Initial empty state
  if (chatArray.length === 0 && !isLoading) {
    return (
      <LoadingComponent text="Starting up your personalized health consultation..." className="text-xl text-gray-600" />
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-4 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E0 #F7FAFC' }}>
      <div className="max-w-4xl mx-auto">
        {renderChatMessages()}

        {/* Loader at bottom when fetching */}
        {isLoading && (
          <LoadingComponent text="Thinking" />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
});

ChatSection.displayName = 'ChatSection';
export default ChatSection;
