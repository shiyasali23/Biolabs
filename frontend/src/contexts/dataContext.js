"use client";
import React, { createContext, useContext, useState } from "react";
import { FaChartLine, FaMicroscope, FaStethoscope } from "react-icons/fa";
import { IoFastFood } from "react-icons/io5";
import { PiDnaFill } from "react-icons/pi";
import { AiFillSlackCircle } from "react-icons/ai";
import { RiHealthBookFill } from "react-icons/ri";
import { SiMatomo } from "react-icons/si";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const companyName = "Biolabs";
  const servicesArray = [
    [
      "Detect Diseases With Biochemicals",
      "Diseases Detections",
      "By analysing various biometrics and biochemicals, multiple systems is created that can detect various kinds of diseases in very high accuracy. Helps to get an early notice about the diseases that can be cause, without get into time consuming lab tests.",
      <FaMicroscope />

    ],
    [
      "Feeling Any kind of Symptoms?",
      "Diagnostics Center",
      "A usual dignosis procedures, the system is capable to percive symptoms and provide an assumption assistance, also provide Medications, Precausions and Diets that can be considered. Also can be served as an assiatnce for doctors to get an second opinion for their findings",
      <FaStethoscope />

    ],
    [
      "Get Suggestions Of Foods For You",
      "Food Recommendation",
      "Considering health metrics and biochemical levels, reccommends optimal food choices. It also functions as a virtual dietitian, offering detailed nutritional information on a wide range of food items. Access how each food and nutrients couples each other with precise data",
      <IoFastFood />

    ],
    [
      "Monitoring Health And Biochemicals",
      "Analytics Platform",
      "Meaningful dashboards to provide maximum insights into the biochemicals. Determine from normal to abnormal values. To understand potential health condition that fall outside the healthy range. Tracking system for biochemical parameters over time to catch anomalies",
      <FaChartLine />

    ],
    [
      "Personalized Artificial Intelligence",
      "Bio Intelligence",
      "Personalized health assistant powered by artificial intelligence seamlessly integrated with all of our services. Designed to provide every possible comprehensive health insights and expert level guidance empowering to make informed decisions",
      <AiFillSlackCircle />

    ],
    [
      "Archive Medical Records And Insight",
      "Bio Vault",
      "Secure space that allows to store any kind of medical informations digitally. From reports and prescriptions to personal health notes and observations. That can be also shared with trusted individuals. To gain insights, track conditions to make informed decisions",
      <RiHealthBookFill />

    ],
    [
      "Create Biology Specific Medicines",
      "Bio Fold",
      "Using advanced protein folding and molecular docking to design custom medications that perfectly matches unique biology. Through quantum-enhanced computational models, simulate how compounds interact with specific cellular receptors at the molecular level.To boost therapeutic outcomes by ensuring optimal drug-target interactions while minimizing adverse effects",
      <SiMatomo />


    ],
    [
      "Analysis And Report Over DNA Sequences",
      "Bio Genes",
      "Genetic analysis to identify inherited health risks by comparing DNA with similar profiles. Advanced algorithms detect subtle genetic variations that traditional tests miss, enabling early intervention before symptoms appear wich shifts healthcare from reactive to preventative",
      <PiDnaFill />

    ]
  ];

  const [diseaseDetectionModals, setDiseaseDetectionModals] = useState([]);
  const [diagnosisModel, setDiagnosisModel] = useState([]);
  const dignosisModelsTypes = ["diagnosis_model", "disease_detections"];
  const authApiOPtions = ["authenticate", "signup"];

  return (
    <DataContext.Provider
      value={{
        servicesArray,
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
