"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/CustomButton";

import { IoMdClose } from "react-icons/io";
import { Loader } from "lucide-react";
import { RiHealthBookFill, RiMentalHealthFill } from "react-icons/ri";
import { AiFillSlackCircle } from "react-icons/ai";
import { FaChevronCircleUp } from "react-icons/fa";
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
  setMessage = () => {}, // Provide default function to prevent errors
}) => {
  const { latestBiometrics } = useUser();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [isBiometricsSelected, setIsBiometricsSelected] = useState(false);

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
      text: isIntelligence ? promt : (text || ""), // Fixed: was using prompt instead of promt
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

  return (
    <div className="w-full rounded-2xl  flex flex-col items-center justify-center gap-2 border  relative bg-gray-50">
      <Textarea
        placeholder="Type here"
        className="h-[20vh] w-full border-none rounded-none shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        onChange={handleTextChange}
        value={isIntelligence ? promt : text || ""}
      />

      <div className="w-full flex items-center justify-between gap-5 px-10">
        <div className="w-full flex gap-2 items-center justify-center">
          {/* Display extracted contents with file previews if available */}
          {currentExtractedContents.map((item, index) => (
            <div
              key={`extract-${index}`}
              className="relative h-[35px] w-[35px] flex-shrink-0"
            >
              <IoMdClose
                onClick={() => handleRemoveFile(index)}
                size={20}
                className="absolute z-10 right-1 top-1 cursor-pointer text-gray-100"
              />
              {uploadedFiles[index] && fileUrls[index] ? (
                <Image
                  src={fileUrls[index].url}
                  alt={`Uploaded ${index}`}
                  fill
                  className="object-cover w-full h-full border"
                  priority={index < 2}
                />
              ) : (
                <div className="text-xs overflow-hidden border h-full w-full bg-gray-100 flex items-center justify-center">
                  {item.substring(0, 3)}...
                </div>
              )}
            </div>
          ))}
        </div>

        <div className=" mb-1">
          {fileLoading ? (
            <Loader className="animate-spin" />
          ) : (
            <div className="flex items-center gap-5">
              <label className="cursor-pointer flex-shrink-0">
                <RiHealthBookFill size={40} className="hover:scale-110" />
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={currentExtractedContents.length >= 2}
                />
              </label>

              {isIntelligence && isLogined && latestBiometrics && (
                <RiMentalHealthFill
                  size={40}
                  className={`cursor-pointer ${
                    isBiometricsSelected ? "text-black" : "text-gray-400"
                  }`}
                  onClick={() => setIsBiometricsSelected(!isBiometricsSelected)}
                />
              )}

              {(isTextValid ||
                (currentExtractedContents &&
                  currentExtractedContents.length > 0)) && (
                <div>
                  {isIntelligence ? (
                    <FaChevronCircleUp
                      onClick={handleSubmitClick}
                      size={40}
                      className="cursor-pointer hover:scale-110"
                    />
                  ) : (
                    <CustomButton text="Save" onClick={handleSubmitClick} />
                  )}
                </div>
              )}

              {setIntelligenceOpen && !isIntelligence && (
                <AiFillSlackCircle
                  size={40}
                  className="cursor-pointer hover:scale-110"
                  onClick={() => setIntelligenceOpen(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(HealthInputPanel);