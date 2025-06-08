// utils/serviceHandler.js
"use client";

import { useRouter } from "next/navigation";

export const useServiceHandler = () => {
  const router = useRouter();

  const handleServiceClick = (
    index,
    isLogined,
    setDiseaseDetectionModalOpen,
    setDiagnosisModalOpen,
    setNoDataFoundModalOpen,
    setCommingSoonModalOpen,
    setIntelligenceOpen,
    setCommingSoonIndex,
    setNoDataFoundRoute = null
  ) => {
    if (index === 0) {
      setDiseaseDetectionModalOpen(true);
    } else if (index === 1) {
      setDiagnosisModalOpen(true);
    } else if (index === 2) {
      router.push("/food");
    } else if (index === 3) {
      if (isLogined) {
        router.push("/analytics");
      } else {
        if (setNoDataFoundRoute) {
          setNoDataFoundRoute("analytics");
        }
        setNoDataFoundModalOpen(true);
      }
    } else if (index === 4) {
      // Add URL parameter when intelligence opens
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.set('intelligence', 'true');
      window.history.pushState({}, '', currentUrl);
      setIntelligenceOpen(true);
    } else if (index === 5) {
      if (isLogined) {
        router.push("/vault");
      } else {
        if (setNoDataFoundRoute) {
          setNoDataFoundRoute("vault");
        }
        setNoDataFoundModalOpen(true);
      }
    } else if (index >= 6) {
      setCommingSoonModalOpen(true);
      setCommingSoonIndex(index);
    }
  };

  const checkIntelligenceParam = (setIntelligenceOpen) => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('intelligence') === 'true') {
      setIntelligenceOpen(true);
    }
  };

  const closeIntelligenceModal = (setIntelligenceOpen) => {
    // Remove URL parameter when intelligence closes
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.delete('intelligence');
    window.history.pushState({}, '', currentUrl);
    setIntelligenceOpen(false);
  };

  return {
    handleServiceClick,
    checkIntelligenceParam,
    closeIntelligenceModal
  };
};