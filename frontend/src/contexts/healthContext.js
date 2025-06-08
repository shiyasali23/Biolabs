"use client";
import React, { createContext, useContext, useState } from "react";
import { FaChartLine, FaMicroscope, FaStethoscope } from "react-icons/fa";
import { IoFastFood } from "react-icons/io5";
import { PiDnaFill } from "react-icons/pi";
import { AiFillSlackCircle } from "react-icons/ai";
import { RiHealthBookFill } from "react-icons/ri";
import { SiMatomo } from "react-icons/si";

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  const questionsArray = {
    default: [
      {
        question: "Gender",
        input_type: "text",
      },
      
      {
        question: "Age",
        input_type: "number",
      },
    ],
    customSlider: [
      {
        question: "Sleep",
      },
      {
        question: "Exercise",
        followup:"How much time you can have daily"
      },
      {
        question: "Clean Food",
        followup:"How much you can spend monthly"
      },
    ],
  };
  const [diseaseDetectionModals, setDiseaseDetectionModals] = useState([]);
  const [diagnosisModel, setDiagnosisModel] = useState([]);
  const dignosisModelsTypes = ["diagnosis_model", "disease_detections"];
  const authApiOPtions = ["authenticate", "signup"];

  return (
    <HealthContext.Provider
      value={{
        questionsArray,
        companyName,
        diseaseDetectionModals,
        setDiseaseDetectionModals,
        diagnosisModel,
        setDiagnosisModel,
        dignosisModelsTypes,
        authApiOPtions,
      }}
    >
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
