"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import CommingSoon from "./CommingSoon";
import NoDataFound from "./NoDataFound";
import DiagnosisModal from "./DiagnosisModal";
import DiseaseDetectionModal from "./DiseaseDetectionModal";
import { useData } from "@/contexts/dataContext";
import Intelligence from "./Intelligence";

const infoUs = ({ isLogined }) => {
  const { servicesArray } = useData();
  const router = useRouter();
  const [diseaseDetectionModalOpen, setDiseaseDetectionModalOpen] = useState(false);
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
  const [noDataFoundModalOpen, setNoDataFoundModalOpen] = useState(false);
  const [commingSoonModalOpen, setCommingSoonModalOpen] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [commingSoonIndex, setCommingSoonIndex] = useState(null);

  const versionGroups = [
    {
      versionText: "(v1.0.0):",
      indices: [0, 1, 2, 3],
    },
    {
      versionText: "(v2.0.0) Up Comming:",
      indices: [4, 5],
    },
    {
      versionText: "(3.0.0) Up Comming:",
      indices: [6, 7],
    },
  ];

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
        setNoDataFoundModalOpen(true);
      }
    }else if (index === 4) {
      setIntelligenceOpen(true);
    } 
    else if (index === 5) {
      if (isLogined) {
        router.push("/vault");
      } else {
        setNoDataFoundModalOpen(true);
      }
    } 
    else if (index >= 5) {
      setCommingSoonModalOpen(true);
      setCommingSoonIndex(index);
    }
  };

  return (
    <div className="w-full h-full my-20">
      <div className="w-full px-10 xl:px-32 py-5 gap-20 flex flex-col">
        <h1 className="text-base leading-[2rem] font-semibold ">
          <span className="font-bold text-3xl mr-2">Biolabs</span>an
          organization founded on October 4th of 2024, designed to keeping
          humans healthy. Built on top of the most advanced, cutting-edge
          technologies and backed by the world's elite medical experts and
          healthcare professionals.Our architecture extent from individuals
          users to every insitution that can contiribute to our vision.
        </h1>

        {versionGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold">
              Biolabs <span className="text-lg">{group.versionText}</span>
            </h1>
            {group.indices.map((serviceIndex) => {
              const service = servicesArray[serviceIndex];
              return (
                <div key={serviceIndex} className=" flex flex-col px-5 hover:cursor-pointer gap-2" onClick={() => handleServiceClick(serviceIndex)}>
                  <span className="font-bold text-lg hover:text-blue-600 ">{service[1]}:</span>
                  <h1 className="ml-5 text-sm leading-[1.5rem] font-semibold hover:text-blue-600">
                    {service[2]}
                  </h1>
                </div>
              );
            })}
          </div>
        ))}

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl w-full text-center font-bold">
            Vision
          </h1>
          <h1 className="text-sm leading-[2rem] font-semibold">
            For the time beigh of a human lives health is the most valuable
            thing.Our vision is a world where every individual, regardless of
            location, has access to essential tools and resources for
            maintaining optimal wellbeing. We're committed to eliminating
            barriers for communities in remote regions with limited healthcare
            facilities, offering innovative solutions that provide valuable
            medical insights without financial strain. Through our approach,
            we're building a future where geographic isolation and economic
            constraints no longer prevent anyone from achieving their fullest
            health potential.
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl w-full text-center font-bold">
            Capable Of
          </h1>
          <h1 className="text-sm leading-[2rem] font-semibold">
            Our platform can be used as a personalized healthcare assistance
            shaped for each users.Also can be connect with any health care
            providers like hospitals. Wich can learns from local health patterns
            to offer helpful insights, making it easier for doctors, nurses or
            any other proffesional to make better treatment and automate
            dignosis.
          </h1>
          <h1 className="text-sm leading-[2rem] font-semibold">
            Imagine connecting each and every healthcare information worldwide
            to bringing global health knowledge under one umbrella. The true
            power of our solution emerges. We can identify emerging health
            trends, guide the development and delivery of new medications,
            pinpoint regions with healthcare worker shortages, and discover gaps
            in medical equipment and pharmaceutical availability. This
            comprehensive approach doesn't just improve individual care wich
            strengthens the entire healthcare ecosystem by creating a foundation
            for more targeted and effective medical innovations.
          </h1>
        </div>
      </div>

      {/* Modals remain unchanged */}
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
          handleButtonClick={() => router.push("/info")}
          route={"analytics"}
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

export default infoUs;

