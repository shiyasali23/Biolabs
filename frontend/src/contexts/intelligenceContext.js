"use client";
import React, { createContext, useContext } from "react";


const IntelligenceContext = createContext();

export const IntelligenceProvider = ({ children }) => {
  
  

  const getGeratedTexts = async (reportData) => {
    console.log("reportData", reportData);
    
  };

  

  return (
    <IntelligenceContext.Provider
      value={{
       
        getGeratedTexts,
      }}
    >
      {children}
    </IntelligenceContext.Provider>
  );
};

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error("useIntelligence must be used within a IntelligenceProvider");
  }
  return context;
};
