"use client";
import React, { useCallback, useMemo, useState } from "react";

const CustomSlider = ({
  input,
  selectedValue,
  setSelectedValue,
  onInteractionEnd,
}) => {
  const steps = useMemo(() => {
    if (Array.isArray(input)) return input.map((_, i) => i);
    return [];
  }, [input]);

  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getStepPosition = useCallback(
    (stepIndex) => 15 + (stepIndex / (steps.length - 1)) * 70,
    [steps]
  );

  const getSliderPosition = useCallback(
    () =>
      currentStepIndex === -1
        ? 5
        : 15 + (currentStepIndex / (steps.length - 1)) * 70,
    [currentStepIndex, steps]
  );

  const handleSliderChange = useCallback(
    (e) => {
      const sliderValue = parseFloat(e.target.value);
      if (sliderValue < 10) return;

      setHasInteracted(true);
      const totalSteps = steps.length - 1;
      const adjustedValue = ((sliderValue - 15) / 70) * 100;
      const stepIndex = Math.round((adjustedValue / 100) * totalSteps);
      const clampedIndex = Math.max(0, Math.min(totalSteps, stepIndex));

      setCurrentStepIndex(clampedIndex);
      if (setSelectedValue) {
        const actualValue = input[clampedIndex];
        setSelectedValue(actualValue);
      }
    },
    [steps, input, setSelectedValue]
  );

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
    if (hasInteracted && currentStepIndex !== -1 && onInteractionEnd) {
      setTimeout(() => onInteractionEnd(), 100);
    }
  }, [onInteractionEnd, hasInteracted, currentStepIndex]);

  const handleStepClick = useCallback(
    (stepIndex) => {
      setHasInteracted(true);
      setCurrentStepIndex(stepIndex);
      if (setSelectedValue) {
        const actualValue = input[stepIndex];
        setSelectedValue(actualValue);
      }
      if (onInteractionEnd) {
        setTimeout(() => onInteractionEnd(), 100);
      }
    },
    [input, setSelectedValue, onInteractionEnd]
  );

  return (
    <div className="w-full  mx-auto">
      {/* Step Labels */}
      <div className="relative w-[90%] mx-auto flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step}
            className="absolute  flex flex-col items-center cursor-pointer "
            style={{
              left: `${getStepPosition(index)}%`,
              transform: "translateX(-50%)",
              top: "-55px",
            }}
            onClick={() => handleStepClick(index)}
          >
            <span
              className={`min-w-[80px]  px-4 py-2   rounded-lg backdrop-blur-xl  transition-all duration-500 ease-out transform ${
                currentStepIndex === index
                  ? " scale-110 shadow-2xl text-blue-600"
                  : "text-gray-800 "
              } backdrop-blur-2xl border border-black/5  font-medium text-sm text-center`}
            >
              {input[index]}
            </span>
            <div
              className={`w-2 h-2 rounded-full mt-4 transition-all duration-500 ${
                currentStepIndex === index
                  ? "bg-blue-600  shadow-blue-600/50 scale-150"
                  : "bg-gray-400 group-hover:bg-gray-300"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Slider Track */}
      <div className="relative px-2 mt-10">
        <div
          style={{ background: "rgba(226, 226, 226, 0.4)" }}
          className="relative h-4  bg-gray-400 rounded-full overflow-hidden   "
        >
          <div
            style={{
              width: `${getSliderPosition() - 1}%`,
              background:
                "linear-gradient(to right,rgb(30, 116, 138), #0ea5e9, #06b6d4, #67e8f9)",
            }}
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out"
          />
        </div>

        {/* Slider Handle */}
        <div
          className={`absolute top-1/2 w-8 h-8 rounded-full cursor-pointer transition-all duration-300 ease-out border ${
            hasInteracted && currentStepIndex !== -1
              ? "bg-white border-white/20 shadow-2xl shadow-black/30 scale-110"
              : "bg-gray-100 border-gray-200/50  "
          } ${isDragging ? "scale-125" : ""}`}
          style={{
            left: `${getSliderPosition()}%`,
            transform: "translateX(-50%) translateY(-50%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />

        {/* Invisible Input */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={getSliderPosition()}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={handleInteractionEnd}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={handleInteractionEnd}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />
      </div>
    </div>
  );
};

export default CustomSlider;
