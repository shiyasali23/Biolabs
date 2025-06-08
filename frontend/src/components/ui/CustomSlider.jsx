import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";

const generateSteps = (lastNumber) => {
  const baseSteps = [];
  for (let i = Math.max(1, lastNumber - 3); i <= lastNumber; i++) {
    baseSteps.push(i);
  }
  return [...baseSteps, lastNumber + 1, lastNumber + 2, lastNumber + 3];
};

const CustomSlider = ({ lastNumber }) => {
  const steps = generateSteps(lastNumber);
  const [value, setValue] = useState([lastNumber]);

  const handleChange = (val) => {
    const closest = steps.reduce((prev, curr) =>
      Math.abs(curr - val[0]) < Math.abs(prev - val[0]) ? curr : prev
    );
    setValue([closest]);
  };

  return (
    <div className="w-full max-w-md">
      <Slider
        min={steps[0]}
        max={steps[steps.length - 1]}
        step={1}
        value={value}
        onValueChange={handleChange}
      />
      <p className="mt-2 text-sm text-muted-foreground">Selected: {value[0]}</p>
    </div>
  );
};

export default CustomSlider;
