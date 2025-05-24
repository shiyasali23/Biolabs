"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useUser } from "@/contexts/userContext";
import HealthInputPanel from "@/components/HealthInputPanel";
import ChatSection from "@/components/ChatSection";
import { inference } from "@/lib/intelligence-api";

const Intelligence = ({ isOpen, onClose, text = "", extractedTexts = [], setMessage }) => {
  const { isLogined } = useUser();
  const abortControllerRef = useRef(null);

  const [promt, setPromt] = useState("");
  const [extractedPromts, setExtractedPromts] = useState([]);
  const [chatArray, setChatArray] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Initialize chat with welcome message when opened
  useEffect(() => {
    if (isOpen) {
      setPromt(text);
      // Copy only up to 2 extractedTexts to extractedPromts when the panel opens
      if (extractedTexts.length > 0) {
        setExtractedPromts(extractedTexts.slice(0, 2));
      }
      
      // Add welcome message if chat is empty
      if (chatArray.length === 0) {
        setChatArray([{
          promt: "", // Empty promt for initial message
          response: "Hi! I'm your AI Health Assistant. What's your health concern today? or any documents you'd like me to review.",
          isInitial: true
        }]);
      }
    }
  }, [isOpen, text, extractedTexts]);

  // Cleanup on component unmount or close
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Clean up on close
  useEffect(() => {
    if (!isOpen && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [isOpen]);

  const getGeratedTexts = useCallback(async (inputData) => {
    if (!inputData?.query?.trim()) return null;

    // Check for intro inputs to provide instant response
    const query = inputData.query.trim().toLowerCase();
    const INTRO_INPUTS = [
      "hi", "hello", "hey",
      "good morning", "good afternoon", "good evening",
      "how are you", "what can you do", "who are you"
    ];
    
    if (INTRO_INPUTS.includes(query)) {
      // Return instantly for intro messages without loading state
      const result = await inference(inputData);
      return result;
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    setChatLoading(true);
    
    try {
      const result = await inference(inputData, abortControllerRef.current.signal);
      return result;
    } catch (error) {
      console.error("Generation error:", error);
      return {
        message: "Something went wrong. Please try again.",
        data: null,
        isRelevant: false
      };
    } finally {
      setChatLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const handleSend = useCallback(async (inputData) => {
    if (!inputData?.query?.trim()) return;
    
    const result = await getGeratedTexts(inputData);
    
    if (!result) return;
    
    // Only add to chat if the response is successful and relevant
    if (result.isRelevant && (result.data?.generated_text || result.message)) {
      setChatArray((prev) => [...prev, {
        promt: inputData.query,
        response: result.data?.generated_text || result.message,
        isInitial: false
      }]);
    } else if (!result.isRelevant && result.message) {
      // For irrelevant queries, show error message without adding user prompt
      setChatArray((prev) => [...prev, {
        promt: "", // Don't show user message for errors
        response: result.message,
        isInitial: false,
        isError: true
      }]);
    }
    
    // Clear the input after processing
    setPromt("");
  }, [getGeratedTexts]);

  const handleClose = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setChatLoading(false);
    
    // Reset chat array to empty when closing
    setChatArray([]);
    setPromt("");
    setExtractedPromts([]);
    
    onClose();
  }, [onClose]);

  return (
    <div
      className={`fixed top-0 right-0 w-screen xl:w-1/2 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="relative w-full h-[5vh] flex items-center justify-end pr-5 xl:pr-10 border-b border-gray-200">
        <FaTimes 
          className="cursor-pointer text-2xl hover:text-gray-600 transition-colors" 
          onClick={handleClose} 
        />
      </div>

      <div className="flex-1 h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ChatSection 
            chatArray={chatArray} 
            isLoading={chatLoading}
          />
        </div>

        <div className="border-t border-gray-200 bg-white">
          <div className="w-full px-2 py-4">
            <HealthInputPanel
              isIntelligence={true}
              isLogined={isLogined}
              handleSend={handleSend}
              promt={promt}
              setPromt={setPromt}
              extractedPromts={extractedPromts}
              setExtractedPromts={setExtractedPromts}
              setMessage={setMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Intelligence);