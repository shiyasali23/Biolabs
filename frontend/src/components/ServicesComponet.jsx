import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DiseaseDetectionModal from "./DiseaseDetectionModal";
import DiagnosisModal from "./DiagnosisModal";

import { useData } from "@/contexts/dataContext";
import CustomButton from "./CustomButton";
import { useUser } from "@/contexts/userContext";
import NoDataFound from "./NoDataFound";
import CommingSoon from "./CommingSoon";
import Intelligence from "./Intelligence";

const ServicesComponent = () => {
  const { servicesArray } = useData();
  const { isLogined } = useUser();

  const router = useRouter();
  const [diseaseDetectionModalOpen, setDiseaseDetectionModalOpen] =
    useState(false);
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
  const [noDataFoundModalOpen, setNoDataFoundModalOpen] = useState(false);
  const [commingSoonModalOpen, setCommingSoonModalOpen] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [commingSoonIndex, setCommingSoonIndex] = useState(null);
  const [noDataFoundRoute, setNoDataFoundRoute] = useState(null);

  const handleServiceClick = (index) => {
    
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
        setNoDataFoundRoute("analytics");
        setNoDataFoundModalOpen(true);
      }
    }else if (index === 4) {
      setIntelligenceOpen(true);
    } 
    else if (index === 5) {
      if (isLogined) {
        router.push("/vault");
      } else {
        setNoDataFoundRoute("vault");
        setNoDataFoundModalOpen(true);
      }
    } 
    else if (index >= 5) {
      setCommingSoonModalOpen(true);
      setCommingSoonIndex(index);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-evenly p-2 xl:p-4 gap-5">
      <h1 className="text-3xl xl:text-4xl underline underline-offset-8  font-bold">
        Our Services
      </h1>
      <div className=" grid grid-cols-2 md:grid-cols-3 gap-7 xl:px-12 w-full">
        {servicesArray.map((service, index) => (
          <div
            key={index}
            onClick={() => handleServiceClick(index)}
            className="shadow-xl rounded   cursor-pointer py-2 px-1 xl:py-5 hover:shadow-2xl  sm:h-[10rem] xl:h-[10rem] flex flex-col justify-between   gap-4"
          >
            <h1 className="tracking-wider word-spacing-wider text-xs xl:text-lg font-semibold text-left leading-tight px-2 xl:px-8">
              {service[0]}
            </h1>
            <div className="px-0 xl:px-8">
              <CustomButton
                text={
                  <span className="flex items-center gap-2">
                    {service[3]} {/* Renders the icon properly */}
                    {service[1]} {/* Renders the text */}
                  </span>
                }
                className="mx-auto w-full text-xs rounded"
              />
            </div>
          </div>
        ))}
      </div>

      {diseaseDetectionModalOpen && (
        <DiseaseDetectionModal
          isOpen={diseaseDetectionModalOpen}
          onClose={() => setDiseaseDetectionModalOpen(false)}
        />
      )}

      {diagnosisModalOpen && (
        <DiagnosisModal
          isOpen={diagnosisModalOpen}
          onClose={() => setDiagnosisModalOpen(false)}
        />
      )}

      {noDataFoundModalOpen && (
        <NoDataFound
          isOpen={noDataFoundModalOpen}
          onClose={() => setNoDataFoundModalOpen(false)}
          isModal={true}
          route={noDataFoundRoute}
        />
      )}

      {commingSoonModalOpen && (
        <CommingSoon
          isOpen={commingSoonModalOpen}
          onClose={() => setCommingSoonModalOpen(false)}
          commingSoonIndex={commingSoonIndex}
        />
      )}

      {intelligenceOpen && (
        <Intelligence isOpen={intelligenceOpen} onClose={() => setIntelligenceOpen(false)} />
      )}
    </div>
  );
};

export default ServicesComponent;
