"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import CommingSoon from "./CommingSoon";
import NoDataFound from "./NoDataFound";
import DiagnosisModal from "./DiagnosisModal";
import DiseaseDetectionModal from "./DiseaseDetectionModal";
import { useData } from "@/contexts/dataContext";
import Intelligence from "./Intelligence";
import { useServiceHandler } from "@/utils/serviceHandler";

const AboutUs = ({ isLogined }) => {
  const { servicesArray } = useData();
  const router = useRouter();
  const [diseaseDetectionModalOpen, setDiseaseDetectionModalOpen] =
    useState(false);
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
  const [noDataFoundModalOpen, setNoDataFoundModalOpen] = useState(false);
  const [commingSoonModalOpen, setCommingSoonModalOpen] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [commingSoonIndex, setCommingSoonIndex] = useState(null);

  const { handleServiceClick, checkIntelligenceParam, closeIntelligenceModal } =
    useServiceHandler();

  // Check for intelligence parameter on component mount
  useEffect(() => {
    checkIntelligenceParam(setIntelligenceOpen);
  }, []);

  const versionGroups = [
    {
      date: "Oct 4, 2024",
      version: "v1.0.0",
      status: "Released",
      indices: [0, 1, 2, 3],
    },
    {
      date: "Jun 18, 2025",
      version: "v2.0.0",
      status: "Released",
      indices: [4, 5],
    },
    {
      date: "Mar 20, 2025",
      version: "v3.0.0",
      status: "Upcoming",
      indices: [6, 7],
    },
  ];

  const onServiceClick = (index) => {
    handleServiceClick(
      index,
      isLogined,
      setDiseaseDetectionModalOpen,
      setDiagnosisModalOpen,
      setNoDataFoundModalOpen,
      setCommingSoonModalOpen,
      setIntelligenceOpen,
      setCommingSoonIndex
    );
  };

  return (
    <div className="w-full h-full my-20">
      <div className="w-full px-10 xl:px-32 py-5 gap-16 flex flex-col">
        <h1 className="text-base leading-[2rem] font-semibold ">
          <span className="font-bold text-3xl mr-2">Biolabs</span>an
          organization founded on October 4th of 2024, designed to keeping
          humans healthy. Built on top of the most advanced, cutting-edge
          technologies and backed by the world's elite medical experts and
          healthcare professionals.Our architecture extent from individuals
          users to every insitution that can contiribute to our vision.
        </h1>

        {/* Version Release Table */}
        <div className="flex flex-col gap-5">
          <h1 className="text-2xl font-semibold">Release Notes:</h1>
          <table className="w-full">
            <tbody>
              {versionGroups.map((group, groupIndex) => (
                <tr
                  key={groupIndex}
                  className="border-b  flex items-center gap-16 p-3"
                >
                  <td className=" font-semibold h-full w-[5%] text-left text-md">
                    {groupIndex == versionGroups.length - 1
                      ? "Upcoming"
                      : group.date}{" "}
                    <span className="text-xs text-gray-500">
                      ({group.version})
                    </span>
                  </td>

                  <td className=" ml-2">
                    {group.indices.map((serviceIndex) => {
                      const service = servicesArray[serviceIndex];
                      return (
                        <div
                          key={serviceIndex}
                          className="flex flex-col  mb-10"
                        >
                          <h1
                            key={serviceIndex}
                            className="hover:cursor-pointer hover:text-blue-600 mb-1 font-bold text-lg  leading-[2rem] tracking-normal"
                            onClick={() => onServiceClick(serviceIndex)}
                          >
                            {service[1]}
                          </h1>
                          <h1
                            key={serviceIndex + 1}
                            className="hover:cursor-pointer   ml-5 text-sm leading-[2rem] font-semibold tracking-normal"
                            onClick={() => onServiceClick(serviceIndex)}
                          >
                            {service[2]}
                          </h1>
                        </div>
                      );
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl w-full text-center font-bold">Vision</h1>
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
          <h1 className="text-3xl w-full text-center font-bold">Capable Of</h1>
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
        <Intelligence
          isOpen={intelligenceOpen}
          onClose={() => closeIntelligenceModal(setIntelligenceOpen)}
        />
      )}
    </div>
  );
};

export default AboutUs;
