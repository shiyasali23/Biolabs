"use client";

import { useEffect, useRef } from "react";
import { Bot, UserRound } from "lucide-react";

export default function ChatSection({ chatArray = [], isLoading = false }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [chatArray, isLoading]);

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-7" role="log" aria-live="polite" aria-label="Clinical intelligence conversation">
      <div className="mx-auto max-w-2xl space-y-7">
        {chatArray.map((chat, index) => (
          <div key={`${index}-${chat.promt || chat.response || "message"}`} className="space-y-5">
            {chat.promt && (
              <div className="flex justify-end gap-3">
                <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-[var(--biolabs-ink)] px-4 py-3 text-base leading-7 text-white whitespace-pre-wrap break-words">{chat.promt}</div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--biolabs-ink)] text-white"><UserRound aria-hidden="true" size={15} /></span>
              </div>
            )}
            {chat.response && (
              <div className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><Bot aria-hidden="true" size={16} /></span>
                <div className="max-w-[85%] rounded-xl rounded-tl-sm border bg-white px-4 py-3 text-base leading-7 text-[var(--biolabs-slate)] whitespace-pre-wrap break-words">{chat.response}</div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 text-sm text-[var(--biolabs-slate)]" aria-label="Generating a response">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><Bot aria-hidden="true" size={16} /></span>
            <span className="flex items-center gap-1 rounded-xl border bg-white px-4 py-3">
              <span>Reviewing</span>
              {[0, 1, 2].map((item) => <span key={item} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--biolabs-teal)]" style={{ animationDelay: `${item * 140}ms` }} />)}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
