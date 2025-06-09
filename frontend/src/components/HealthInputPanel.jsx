"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/CustomButton";

import { X, Loader2, FileImage, Activity, Brain, Send, Plus, Sparkles } from "lucide-react";
import { useUser } from "@/contexts/userContext";
import { extractTextFromImage } from "@/utils/vault-utils";

const HealthInputPanel = ({
  isIntelligence,
  isLogined,
  handleRecordUpdate = null,
  getGeratedTexts = null,
  setIntelligenceOpen = null,
  extractedTexts = [],
  setExtractedTexts,
  extractedPromts = [],
  setExtractedPromts,
  text = "",
  setText,
  promt = "",
  setPromt,
  setMessage = () => {},
}) => {
  const { latestBiometrics } = useUser();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [isBiometricsSelected, setIsBiometricsSelected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Use the appropriate state based on whether we're in intelligence mode or not
  const currentExtractedContents = isIntelligence
    ? extractedPromts
    : extractedTexts;

  const fileUrls = useMemo(() => {
    return uploadedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [uploadedFiles]);

  useEffect(() => {
    return () => {
      fileUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [fileUrls]);

  const handleFileChange = useCallback(
    async (e) => {
      if (!e.target.files || e.target.files.length === 0) return;

      setMessage("");
      setFileLoading(true);
      try {
        const files = Array.from(e.target.files);
        for (const file of files) {
          const extractedText = await extractTextFromImage(file);
          if (extractedText && extractedText.trim().length > 0) {
            // Limit to 2 items, pushing out the oldest when adding new ones
            if (isIntelligence) {
              setExtractedPromts((prev) => {
                const newContents = [...prev, extractedText];
                return newContents.slice(-2); // Keep only last 2 items
              });
            } else {
              setExtractedTexts((prev) => {
                const newContents = [...prev, extractedText];
                return newContents.slice(-2); // Keep only last 2 items
              });
            }

            // Update uploadedFiles to match our text extractions
            setUploadedFiles((prev) => {
              const newFiles = [...prev, file];
              return newFiles.slice(-2); // Keep only last 2 items
            });
          } else {
            setMessage("Nothing could be extracted from the image");
          }
        }
      } catch (err) {
        console.error("File processing error:", err);
        setMessage("Error processing files");
      } finally {
        setFileLoading(false);
      }
    },
    [setExtractedTexts, setExtractedPromts, isIntelligence, setMessage]
  );

  const handleRemoveFile = useCallback(
    (index) => {
      // We remove the file and the extracted text at the same time
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

      if (isIntelligence) {
        setExtractedPromts((prev) => prev.filter((_, i) => i !== index));
      } else {
        setExtractedTexts((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [setExtractedTexts, setExtractedPromts, isIntelligence]
  );

  const handleTextChange = (e) => {
    setMessage("");
    if (isIntelligence) {
      setPromt(e.target.value);
    } else {
      setText(e.target.value);
    }
  };

  const isTextValid = useMemo(() => {
    return isIntelligence ? promt && promt.length > 0 : text && text.length > 0;
  }, [isIntelligence, text, promt]);

  const handleSubmitClick = () => {
    setMessage("");

    const recordData = {
      text: isIntelligence ? promt : (text || ""),
    };

    // Add extracted texts to recordData
    const extractedContents = isIntelligence ? extractedPromts : extractedTexts;
    if (Array.isArray(extractedContents) && extractedContents.length > 0) {
      if (isIntelligence) {
        recordData.files = [...extractedContents];
      } else {
        extractedContents.forEach((text, i) => {
          recordData[`file_${i + 1}`] = text;
        });
      }
    }

    if (isBiometricsSelected && Array.isArray(latestBiometrics) && latestBiometrics.length > 0) {
      recordData.biometrics = latestBiometrics.reduce((acc, biometric) => {
        acc[biometric.name] = {
          value: biometric.value,
          healthy_min: biometric.healthy_min,
          healthy_max: biometric.healthy_max,
        };
        return acc;
      }, {});
    }

    if (isIntelligence) {
      getGeratedTexts(recordData);
    } else if (!isIntelligence) {
      handleRecordUpdate(recordData);
    }
    console.log("Record data from healthinput:", recordData);
  };

  const currentText = isIntelligence ? promt : text || "";
  const hasContent = isTextValid || (currentExtractedContents && currentExtractedContents.length > 0);

  return (
    <div className="w-full bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
      {/* Header with attached files and biometrics */}
      {(currentExtractedContents.length > 0 || isBiometricsSelected) && (
        <div className="px-4 py-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <span className="text-cyan-300 text-sm font-medium">Attached Content</span>
            <div className="flex items-center space-x-2">
              {currentExtractedContents.length > 0 && (
                <div className="flex items-center space-x-1">
                  <FileImage className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300 text-xs">{currentExtractedContents.length} files</span>
                </div>
              )}
              {isBiometricsSelected && latestBiometrics && (
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-xs">Biometrics</span>
                </div>
              )}
            </div>
          </div>
          
          {/* File Previews */}
          {currentExtractedContents.length > 0 && (
            <div className="flex gap-2 mt-3">
              {currentExtractedContents.map((item, index) => (
                <div
                  key={`extract-${index}`}
                  className="relative group"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-700/50">
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {uploadedFiles[index] && fileUrls[index] ? (
                      <Image
                        src={fileUrls[index].url}
                        alt={`Uploaded ${index}`}
                        fill
                        className="object-cover"
                        priority={index < 2}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileImage className="w-6 h-6 text-cyan-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Input Area */}
      <div className="relative">
        <textarea
          placeholder={isIntelligence ? "Describe your health concern or ask a question..." : "Type your health notes here..."}
          className="w-full h-32 px-4 py-4 bg-transparent text-white placeholder-cyan-300/60 border-none resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed"
          onChange={handleTextChange}
          value={currentText}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
        />
        
        {/* Gradient Overlay for Focus Effect */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl"></div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="px-4 py-3 border-t border-cyan-500/20 bg-gradient-to-r from-slate-800/40 to-slate-700/40">
        <div className="flex items-center justify-between">
          {/* Left Side - File Upload and Biometrics */}
          <div className="flex items-center space-x-3">
            {/* File Upload */}
            <label className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
              fileLoading 
                ? 'bg-cyan-500/20 cursor-not-allowed' 
                : 'hover:bg-cyan-500/20 group'
            } ${currentExtractedContents.length >= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {fileLoading ? (
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              ) : (
                <div className="relative">
                  <FileImage className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  {currentExtractedContents.length < 2 && (
                    <Plus className="w-3 h-3 text-cyan-400 absolute -top-1 -right-1 bg-slate-800 rounded-full" />
                  )}
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={currentExtractedContents.length >= 2 || fileLoading}
              />
            </label>

            {/* Biometrics Toggle */}
            {isIntelligence && isLogined && latestBiometrics && (
              <button
                onClick={() => setIsBiometricsSelected(!isBiometricsSelected)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isBiometricsSelected 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'hover:bg-green-500/20 text-green-400/60 hover:text-green-400'
                }`}
              >
                <Activity className="w-5 h-5" />
              </button>
            )}

            {/* Intelligence Toggle for non-intelligence mode */}
            {setIntelligenceOpen && !isIntelligence && (
              <button
                onClick={() => setIntelligenceOpen(true)}
                className="p-2 rounded-lg hover:bg-purple-500/20 text-purple-400/60 hover:text-purple-400 transition-all duration-200 group"
              >
                <div className="relative">
                  <Brain className="w-5 h-5" />
                  <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-purple-400 animate-pulse" />
                </div>
              </button>
            )}
          </div>

          {/* Right Side - Submit Button */}
          {hasContent && (
            <div className="flex items-center space-x-2">
              {isIntelligence ? (
                <button
                  onClick={handleSubmitClick}
                  className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200 group shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/35"
                >
                  <Send className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </button>
              ) : (
                <div className="transform hover:scale-105 transition-transform">
                  <CustomButton text="Save" onClick={handleSubmitClick} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Character Count for Intelligence Mode */}
        {isIntelligence && currentText && (
          <div className="flex justify-end mt-2">
            <span className="text-cyan-300/60 text-xs">
              {currentText.length} characters
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(HealthInputPanel);