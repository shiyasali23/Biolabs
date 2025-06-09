"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Sparkles, Brain, Zap } from "lucide-react";
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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isOpen && !isInitialized) {
      setPromt(text);
      if (extractedTexts.length > 0) {
        setExtractedPromts(extractedTexts.slice(0, 2));
      }

      if (chatArray.length === 0) {
        setChatArray([
          {
            promt: "",
            response:
              "Hi! What's your health concern today? Should I need to review any documents?",
          },
        ]);
        setShouldAnimate(false);
      }
      setIsInitialized(true);
    }
  }, [isOpen, text, extractedTexts, isInitialized]);

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
    setIsInitialized(false);
    onClose();
  }, [onClose]);

  const isInitialState = chatArray.length <= 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Main Panel */}
      <div
        className={`fixed top-0 right-0 w-screen xl:w-[55vw] h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-2xl transform transition-all duration-500 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tl from-blue-500/5 to-transparent rounded-full animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 h-[8vh] flex items-center justify-between px-6 xl:px-8 border-b border-cyan-500/20 backdrop-blur-xl bg-black/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                Health Intelligence
              </h2>
              <p className="text-cyan-300/60 text-sm">AI-Powered Health Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {chatLoading && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-300 text-sm font-medium">Analyzing...</span>
              </div>
            )}
            
            <button
              onClick={handleClose}
              className="p-2 hover:bg-cyan-500/20 rounded-lg transition-all duration-200 group"
            >
              <X className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 h-[92vh] flex flex-col">
          {/* Welcome Message for Initial State */}
          {isInitialState && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="max-w-2xl text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                  <div className="relative p-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">
                    Welcome to Health Intelligence
                  </h3>
                  <p className="text-cyan-300/80 text-lg leading-relaxed">
                    Your AI-powered health assistant is ready to help analyze your health concerns,
                    review medical documents, and provide personalized insights.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="p-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl rounded-xl border border-cyan-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-medium text-sm">Quick Analysis</span>
                    </div>
                    <p className="text-cyan-300/60 text-xs">
                      Get instant insights on your health questions
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl rounded-xl border border-cyan-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium text-sm">Document Review</span>
                    </div>
                    <p className="text-cyan-300/60 text-xs">
                      Upload and analyze medical reports
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl rounded-xl border border-cyan-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span className="text-white font-medium text-sm">Personalized Care</span>
                    </div>
                    <p className="text-cyan-300/60 text-xs">
                      Tailored recommendations for you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Section */}
          {!isInitialState && (
            <div className="flex-1 overflow-hidden">
              <ChatSection chatArray={chatArray} isLoading={chatLoading} />
            </div>
          )}

          {/* Health Input Panel */}
          <div
            className={`
              ${isInitialState 
                ? "absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full px-6 max-w-3xl"
                : "px-4 mb-6 xl:mb-8"
              }
              transition-all duration-500 ease-in-out
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
    </>
  );
};

export default React.memo(Intelligence);