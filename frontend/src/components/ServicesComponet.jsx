import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DiseaseDetectionModal from "./DiseaseDetectionModal";
import DiagnosisModal from "./DiagnosisModal";
import { useData } from "@/contexts/dataContext";
import { useUser } from "@/contexts/userContext";
import NoDataFound from "./NoDataFound";
import CommingSoon from "./CommingSoon";
import Intelligence from "./Intelligence";
import { useServiceHandler } from "@/utils/serviceHandler";

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
  const [expandedIndex, setExpandedIndex] = useState(null);

  const { handleServiceClick, checkIntelligenceParam, closeIntelligenceModal } =
    useServiceHandler();

  useEffect(() => {
    checkIntelligenceParam(setIntelligenceOpen);
  }, []);

  const onServiceClick = (index) => {
    handleServiceClick(
      index,
      isLogined,
      setDiseaseDetectionModalOpen,
      setDiagnosisModalOpen,
      setNoDataFoundModalOpen,
      setCommingSoonModalOpen,
      setIntelligenceOpen,
      setCommingSoonIndex,
      setNoDataFoundRoute
    );
  };

  const toggleDescription = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-20 pb-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-light text-gray-900 tracking-tight mb-3">
            Our Services
          </h1>
        </div>
      </div>

      <div className="px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1  lg:grid-cols-2 gap-3">
            {servicesArray.map((service, index) => (
              <div
                key={index}
                onClick={() => onServiceClick(index)}
                className="flex flex-col gap-2 group bg-gray-50/50 border border-gray-200/60 rounded-2xl p-8 cursor-pointer transition-all duration-200 hover:bg-white hover:border-gray-300/80 hover:shadow-sm active:scale-[0.98]"
              >
                <div className="  w-12 h-12 mb-2 flex items-center justify-center bg-gray-200 hover:bg-gray-600 text-blue-400 rounded-xl   transition-all duration-300">
                  {service[3]}
                </div>
                <span className="text-xl font-semibold text-gray-900 ">
                  {service[1]}
                </span>
                <div className="space-y-3">
                  <h3 className="text-md font-medium text-gray-800">
                    {service[0]}
                  </h3>
                  
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="relative">
                    <p
                      className={`text-sm text-gray-500 leading-relaxed ${
                        expandedIndex === index ? "" : "truncate"
                      }`}
                    >
                      {service[2] || "Advanced healthcare solution"}
                    </p>
                  </div>
                  {service[2] && service[2].length > 100 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(index);
                      }}
                      className="text-sm font-medium mt-1 focus:outline-none"
                    >
                      {expandedIndex === index ? "Know Less" : "Know More" }

                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
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
        <Intelligence
          isOpen={intelligenceOpen}
          onClose={() => closeIntelligenceModal(setIntelligenceOpen)}
        />
      )}
    </div>
  );
};

export default ServicesComponent;
