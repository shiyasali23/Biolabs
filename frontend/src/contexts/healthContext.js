"use client";
import React, { createContext, useContext } from "react";

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  

  const questionsArray = [
    {
      question: "Mental Health",
      input: ["Depression", "Anxiety", "Neither"],
    },
    {
      question: "Gender",
      skippable: true,
      input: ["Male", "Female"],
    },
    {
      question: "Age Group",
      skippable: true,
      input: ["15-25", "26-35", "36-45", "46+"],
    },
    
    {
      question: "Sleep",
      input: ["Poor", "Average", "Good", "Excellent"],
    },
    {
      question: "Exercise",
      input: ["Never", "Rarely", "Always"],
      followup: {
        question: "Contact with sunlight",
        input: 3,
        skippable: true,
      },
    },
    {
      question: "Nutritional quality",
      input: ["Poor", "Average", "Good", "Excellent"],
    },
    {
      question: "Stress",
      input: ["Most of the time", "Sometimes", "Rarely"],
      followup: {
        question: "Job satisfaction",
        input: ["Dissatisfied", "Neutral", "Satisfied"],
        skippable: true,
      },
    },
    {
      question: "Social wellbeing",
      input: ["Low", "Moderate", "Strong"],
    },
    {
      question: "Fatigue",
      skippable: true,
      input: ["Always", "Sometimes", "No"],
    },
    {
      question: "Financial stability",
      skippable: true,
      input: ["Low", "Moderate", "Stable"],
    },
    {
      question: "Relationship status",
      skippable: true,
      input: ["Yes", "No"],
      followup: {
        question: "Relationship satisfaction",
        skippable: true,
        input: [ "Average", "Good", "Excellent"],
      },
    },
  ];

  return (
    <HealthContext.Provider value={questionsArray}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
};
