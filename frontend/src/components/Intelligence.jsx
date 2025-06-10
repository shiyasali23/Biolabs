"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useUser } from "@/contexts/userContext";
import HealthInputPanel from "@/components/HealthInputPanel";
import ChatSection from "@/components/ChatSection";
import { inference } from "@/lib/intelligence-api";

const Intelligence = ({
  isOpen,
  onClose,
  text = "",
  extractedTexts = [],
  setMessage,
}) => {
  const { isLogined } = useUser();

  const [promt, setPromt] = useState("");
  const [extractedPromts, setExtractedPromts] = useState([]);
  const [chatArray, setChatArray] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPromt(text);
      if (extractedTexts.length > 0) {
        setExtractedPromts(extractedTexts.slice(0, 2));
      }

      if (chatArray.length === 0) {
        setChatArray([
          {
            promt: "",
            response:
              "Hi! What's your health concern today? should i need to review any documents?",
          },
        ]);
        setShouldAnimate(false);
      }
    }
  }, [isOpen, text, extractedTexts]);

  // Trigger animation when chat array grows
  useEffect(() => {
    if (chatArray.length > 1) {
      setShouldAnimate(true);
    }
  }, [chatArray.length]);

  const getGeratedTexts = useCallback(async (inputData) => {
    setChatLoading(true);
    console.log("inputData data from intelligence:", inputData);

    try {
      const result = await inference(inputData);
      if (result && result.response) {
        setChatArray((prev) => [
          ...prev,
          { promt: inputData.text, response: result.response },
        ]);
      } else {
        setChatArray((prev) => [
          ...prev,
          { promt: inputData.text, response: "Something went wrong" },
        ]);
      }
      setPromt("");
      setExtractedPromts([]);
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setChatLoading(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    setChatLoading(false);
    setChatArray([]);
    setPromt("");
    setExtractedPromts([]);
    setShouldAnimate(false);

    onClose();
  }, [onClose]);

  const isInitialState = chatArray.length <= 1;

  return (
    <div
      className={`fixed top-0 rounded-2xl right-0 w-screen xl:w-[50vw] h-full my-auto bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="relative w-full h-[5vh] flex items-center justify-end pr-5 xl:pr-10">
        <FaTimes
          className="cursor-pointer text-2xl hover:text-gray-600 transition-colors"
          onClick={handleClose}
        />
      </div>

      <div className="flex-1 h-full flex flex-col relative">
        {/* Chat Section */}
        <div className="flex-1 overflow-hidden">
          <ChatSection chatArray={chatArray} isLoading={chatLoading} />
        </div>

        {/* Health Input Panel */}
        <div
          className={`
            ${isInitialState 
              ? "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-4 max-w-2xl"
              : "px-2 mb-9 xl:mb-12"
            }
            ${shouldAnimate && !isInitialState ? "animate-slide-to-bottom" : ""}
          `}
        >
          <HealthInputPanel
            isIntelligence={true}
            isLogined={isLogined}
            getGeratedTexts={getGeratedTexts}
            promt={promt}
            setPromt={setPromt}
            extractedPromts={extractedPromts}
            setExtractedPromts={setExtractedPromts}
            setMessage={setMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Intelligence);