"use client";
import React, { createContext, useContext, useState } from "react";
import { FaChartLine, FaMicroscope, FaStethoscope } from "react-icons/fa";
import { IoFastFood } from "react-icons/io5";
import { PiDnaFill } from "react-icons/pi";
import { AiFillSlackCircle } from "react-icons/ai";
import { RiHealthBookFill, RiMentalHealthFill } from "react-icons/ri";
import { SiMatomo } from "react-icons/si";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const companyName = "Biolabs";
  const servicesArray = [
    [
      "Detect Diseases With Biochemicals",
      "Diseases Detections",
      "Analyze biochemical and biometric inputs with focused screening models designed to surface patterns that may warrant further clinical review.",
      <FaMicroscope key="diseases-detections" />

    ],
    [
      "Feeling Any kind of Symptoms?",
      "Diagnostics Center",
      "Structure reported symptoms and generate an informational model result with supporting precautions, nutrition considerations, and care context.",
      <FaStethoscope key="diagnostics-center" />

    ],
    [
      "Get Suggestions Of Foods For You",
      "Food Recommendation",
      "Explore nutritional data and personalized food recommendations informed by available health metrics and biochemical measurements.",
      <IoFastFood key="food-recommendation" />

    ],
    [
      "Monitoring Health And Biochemicals",
      "Analytics Platform",
      "Monitor biochemical measurements over time, compare results with reference ranges, and review associated clinical context.",
      <FaChartLine key="analytics-platform" />

    ],
    [
      "Personalized Artificial Intelligence",
      "Intelligence",
      "A connected health assistant that can review questions, document extracts, and available biometrics to provide general informational support.",
      <AiFillSlackCircle key="intelligence" />

    ],
    [
      "Archive Medical Records And Insight",
      "Vault",
      "Organize medical-report extracts, personal notes, and health observations in a private authenticated workspace.",
      <RiHealthBookFill key="vault" />

    ],
    [
      "Create Biology Specific Medicines",
      "Fold",
      "Explore biology-specific medicine research through protein structures, molecular interactions, and computational analysis.",
      <SiMatomo key="fold" />


    ],
    [
      "Helps for psychological states",
      "Mind",
      "Structured tools for reviewing psychological wellbeing and supporting informed conversations about mental health.",
      <RiMentalHealthFill key="mind" />


    ],
    [
      "Analysis And Report Over DNA Sequences",
      "Genes",
      "Genetic-data analysis designed to organize sequence information and surface patterns for qualified clinical interpretation.",
      <PiDnaFill key="genes" />

    ]
  ];

  const [diseaseDetectionModals, setDiseaseDetectionModals] = useState([]);
  const [diagnosisModel, setDiagnosisModel] = useState([]);
  const diagnosisModelTypes = ["diagnosis_model", "disease_detections"];
  const authApiOptions = ["authenticate", "signup"];

  return (
    <DataContext.Provider
      value={{
        servicesArray,
        companyName,
        diseaseDetectionModals,
        setDiseaseDetectionModals,
        diagnosisModel,
        setDiagnosisModel,
        diagnosisModelTypes,
        authApiOptions,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
