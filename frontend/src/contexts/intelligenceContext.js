"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const IntelligenceContext = createContext();

const hasIntelligenceParam = () => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("intelligence") === "true";
};

const updateIntelligenceParam = (open) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (open) url.searchParams.set("intelligence", "true");
  else url.searchParams.delete("intelligence");
  window.history.pushState({}, "", url);
  window.dispatchEvent(new Event("biolabs:intelligence-state"));
};

export const IntelligenceProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [intelligenceSeed, setIntelligenceSeed] = useState({ text: "", extractedTexts: [] });

  useEffect(() => {
    const syncFromUrl = () => setIsOpen(hasIntelligenceParam());
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener("biolabs:intelligence-state", syncFromUrl);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener("biolabs:intelligence-state", syncFromUrl);
    };
  }, []);

  const openIntelligence = useCallback((options = {}) => {
    const seed = options && typeof options === "object" ? options : {};
    setIntelligenceSeed({
      text: seed.text ?? "",
      extractedTexts: Array.isArray(seed.extractedTexts) ? seed.extractedTexts.slice(0, 2) : [],
    });
    updateIntelligenceParam(true);
    setIsOpen(true);
  }, []);

  const closeIntelligence = useCallback(() => {
    updateIntelligenceParam(false);
    setIsOpen(false);
    setIntelligenceSeed({ text: "", extractedTexts: [] });
  }, []);

  return (
    <IntelligenceContext.Provider value={{ isOpen, intelligenceSeed, openIntelligence, closeIntelligence }}>
      {children}
    </IntelligenceContext.Provider>
  );
};

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) throw new Error("useIntelligence must be used within an IntelligenceProvider");
  return context;
};
