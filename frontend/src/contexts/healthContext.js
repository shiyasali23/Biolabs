"use client";
import React, { createContext, useContext } from "react";

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  

  const questionsArray = [
    {
      question: "Mental Health",
      input: ["Depression", "Anxity", "Normal"],
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
      question: "Clean Food",
      input: ["Poor", "Average", "Good", "Excellent"],
    },
    {
      question: "Stress",
      input: ["Everytime", "Sometimes", "Never"],
      followup: {
        question: "Job satisfaction",
        input: ["Hate it", "Its ok", "Love it"],
        skippable: true,
      },
    },
    {
      question: "Satiscation with people around you",
      input: ["Sad", "Not good", "Happy"],
    },
    {
      question: "Fatigue",
      skippable: true,
      input: ["Always", "Sometimes", "No"],
    },
    {
      question: "Finantial stability",
      skippable: true,
      input: ["Poor", "Its ok", "Stable"],
    },
    {
      question: "Maried",
      skippable: true,
      input: ["Yes", "No"],
      followup: {
        question: "Satisfaction on matertial life",
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
