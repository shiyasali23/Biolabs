"use client";

import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useUser } from "@/contexts/userContext";
import HealthInputPanel from "@/components/HealthInputPanel";
import { useIntelligence } from "@/contexts/intelligenceContext";

const Intelligence = ({ isOpen, onClose, text = "", extractedTexts = [] }) => {
  const { isLogined } = useUser();
  const {getGeratedTexts}=useIntelligence()
  const [promt, setPromt] = useState("");
  const [extractedPromts, setExtractedPromts] = useState([]);
  
  // Initialize or update state when props change
  useEffect(() => {
    if (isOpen) {
      setPromt(text);
      // Copy only up to 2 extractedTexts to extractedPromts when the panel opens
      if (extractedTexts.length > 0) {
        setExtractedPromts(extractedTexts.slice(0, 2));
      }
    }
  }, [isOpen, text, extractedTexts]);

  const handleSend = (response) => {
    console.log("Generated Intelligence Response:", response);
    // Future improvement: show chat history, etc.
    if (response && !response.error) {
      // Clear the form after successful submission
      setPromt("");
      setExtractedPromts([]);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 w-screen xl:w-1/2 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="relative w-full h-[5vh] flex items-center justify-end pr-5 xl:pr-10">
        <FaTimes className="cursor-pointer text-2xl" onClick={onClose} />
      </div>

      <div className="flex-1 h-full flex flex-col items-center justify-center">
        <div className="w-full h-full flex items-center justify-center overflow-y-scroll">
          {/* Later: Chat sections */}
          chat sections
        </div>

        <div className="w-full mb-16 px-2 flex items-center justify-center">
          <HealthInputPanel
            isIntelligence={true}
            handleSend={handleSend}
            isLogined={isLogined}
            getGeratedTexts={getGeratedTexts}
            promt={promt}
            setPromt={setPromt}
            extractedPromts={extractedPromts}
            setExtractedPromts={setExtractedPromts}
          />
        </div>
      </div>
    </div>
  );
};

export default Intelligence;