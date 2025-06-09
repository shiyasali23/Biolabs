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
    if (typeof input === "number") {
      const baseSteps = [];
      for (let i = Math.max(1, input - 3); i <= input + 3; i++)
        baseSteps.push(i);
      return baseSteps;
    }
    return [];
  }, [input]);

  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [hasInteracted, setHasInteracted] = useState(false);

  const getStepPosition = useCallback(
    (stepIndex) => 30 + (stepIndex / (steps.length - 1)) * 60,
    [steps]
  );

  const getSliderPosition = useCallback(
    () =>
      currentStepIndex === -1
        ? 10
        : 30 + (currentStepIndex / (steps.length - 1)) * 60,
    [currentStepIndex, steps]
  );

  const handleSliderChange = useCallback(
    (e) => {
      const sliderValue = parseFloat(e.target.value);
      if (sliderValue < 25) return;

      setHasInteracted(true);
      const totalSteps = steps.length - 1;
      const adjustedValue = ((sliderValue - 30) / 60) * 100;
      const stepIndex = Math.round((adjustedValue / 100) * totalSteps);
      const clampedIndex = Math.max(0, Math.min(totalSteps, stepIndex));

      setCurrentStepIndex(clampedIndex);
      if (setSelectedValue) {
        const actualValue = Array.isArray(input)
          ? input[clampedIndex]
          : steps[clampedIndex];
        setSelectedValue(actualValue);
      }
    },
    [steps, input, setSelectedValue]
  );

  const handleInteractionEnd = useCallback(() => {
    if (hasInteracted && currentStepIndex !== -1 && onInteractionEnd) {
      onInteractionEnd();
    }
  }, [onInteractionEnd, hasInteracted, currentStepIndex]);

  const handleStepClick = useCallback(
    (stepIndex) => {
      setHasInteracted(true);
      setCurrentStepIndex(stepIndex);
      if (setSelectedValue) {
        const actualValue = Array.isArray(input)
          ? input[stepIndex]
          : steps[stepIndex];
        setSelectedValue(actualValue);
      }
      if (onInteractionEnd) onInteractionEnd();
    },
    [steps, input, setSelectedValue, onInteractionEnd]
  );

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative mb-12">
        {steps.map((step, index) => (
          <div
            key={step}
            className="absolute flex flex-col items-center cursor-pointer hover:scale-110 transition-transform duration-200"
            style={{
              left: `${getStepPosition(index)}%`,
              transform: "translateX(-50%)",
              top: "-30px",
            }}
            onClick={() => handleStepClick(index)}
          >
            <span
              className={`text-md font-bold transition-colors duration-300 ${
                currentStepIndex === index
                  ? "text-blue-600 scale-110"
                  : "text-gray-600"
              }`}
            >
              {Array.isArray(input) ? input[index] : step}
            </span>
            <div
              className={`w-3 h-3 rounded-full mt-2 transition-all duration-300 ${
                currentStepIndex === index
                  ? "bg-blue-600 scale-125 shadow-lg"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="relative px-4">
        <div className="relative h-5 bg-gray-200 rounded-full overflow-hidden">
          <div
            style={{
               width: `${getSliderPosition()}%` ,
              background:
                "linear-gradient(to right,rgb(30, 116, 138), #0ea5e9, #06b6d4, #67e8f9)",
            }}
            className="absolute left-0 top-0 h-full rounded-full bg-blue-200"
          />
        </div>

        <div
          className={`absolute top-1/2 w-8 h-8 bg-white rounded-full shadow-xl cursor-pointer transition-all duration-300 ${
            hasInteracted && currentStepIndex !== -1
              ? "border-4 border-blue-500 hover:scale-110"
              : "border-3 border-gray-400"
          }`}
          style={{
            left: `${getSliderPosition()}%`,
            transform: "translateX(-50%) translateY(-50%)",
            boxShadow:
              hasInteracted && currentStepIndex !== -1
                ? "0 6px 20px rgba(59, 130, 246, 0.4)"
                : "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        />

        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={getSliderPosition()}
          onChange={handleSliderChange}
          onMouseUp={handleInteractionEnd}
          onTouchEnd={handleInteractionEnd}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />
      </div>
    </div>
  );
};

export default CustomSlider;
