"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

const IntelligenceContext = createContext();

export const IntelligenceProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.includes("intelligence-open=True")) {
      setIsOpen(true);
    }
  }, [pathname]);

  const openIntelligence = () => {
    const newPath = pathname.endsWith("/")
      ? `${pathname}intelligence-open=True`
      : `${pathname}/intelligence-open=True`;
    router.push(newPath);
    setIsOpen(true);
  };

  const closeIntelligence = () => {
    const cleanPath = pathname.replace("/intelligence-open=True", "");
    router.push(cleanPath || "/");
    setIsOpen(false);
  };

  const getGeratedTexts = async (reportData) => {
    console.log("reportData", reportData);
    // Use your API call here
  };

  return (
    <IntelligenceContext.Provider
      value={{
        isOpen,
        openIntelligence,
        closeIntelligence,
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
    throw new Error("useIntelligence must be used within an IntelligenceProvider");
  }
  return context;
};
