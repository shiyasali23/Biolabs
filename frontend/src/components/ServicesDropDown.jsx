"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaCaretDown, FaSignOutAlt } from "react-icons/fa";
import { useData } from "@/contexts/dataContext";
import { useRouter } from "next/navigation";
import CommingSoon from "./CommingSoon";
import NoDataFound from "./NoDataFound";
import DiagnosisModal from "./DiagnosisModal";
import DiseaseDetectionModal from "./DiseaseDetectionModal";
import Intelligence from "./Intelligence";


const ServicesDropDown = ({ isLogined, logOutUser }) => {
  const { servicesArray } = useData();
  const router = useRouter();
  const [diseaseDetectionModalOpen, setDiseaseDetectionModalOpen] = useState(false);
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
  const [noDataFoundModalOpen, setNoDataFoundModalOpen] = useState(false);
  const [commingSoonModalOpen, setCommingSoonModalOpen] = useState(false);
    const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  
  const [commingSoonIndex, setCommingSoonIndex] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [noDataFoundRoute, setNoDataFoundRoute] = useState("analytics");

  const handleServiceClick = (index) => {
    // Always close the dropdown first
    setDropdownOpen(false);
    
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
        setNoDataFoundRoute("vault");
        setNoDataFoundModalOpen(true);
      }
    } 
    else if (index >= 5) {
      setCommingSoonModalOpen(true);
      setCommingSoonIndex(index);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setDropdownOpen(false);
    }
  };

  // Set up the event listener for clicks outside
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle mouse leave for the entire dropdown component
  const handleMouseLeave = () => {
    setDropdownOpen(false);
  };

  return (
    <div className="relative group" onMouseLeave={handleMouseLeave}>
      <button
        id="dropdownButton"
        onClick={toggleDropdown}
        ref={buttonRef}
        className="p-2 group relative flex items-center justify-center bg-black text-white font-semibold text-center overflow-hidden border-2 border-black transition-all duration-300 hover:bg-white"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <span className="text-xs xl:text-sm relative z-10 group-hover:text-black transition-colors duration-500 ease-out">
          Services
        </span>
        <FaCaretDown
          size={15}
          className="relative z-10 ml-1 group-hover:text-black transition-colors duration-500 ease-out"
        />
        <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500 ease-out"></span>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          id="dropdownMenu"
          ref={dropdownRef}
          className="absolute right-0 bg-white shadow-lg w-56 z-10 border border-gray-200"
        >
          {servicesArray.map((service, index) => (
            <h1
              key={index}
              onClick={() => handleServiceClick(index)}
              className="text-left text-sm block pl-4 py-2 hover:bg-gray-200 transition duration-200 w-full border-b border-dashed my-1 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {service[3]}
                {service[1]}
              </span>
            </h1>
          ))}

          <h1
            onClick={() => {
              setDropdownOpen(false);
              isLogined ? logOutUser() : router.push("/info");
            }}
            className="cursor-pointer text-left text-sm pl-4 py-2 hover:bg-gray-200 transition duration-200 w-full border-b border-dashed my-1 flex items-center"
          >
            <FaSignOutAlt className="mr-2" size={15} />
            {isLogined ? "Log Out" : "Log In"}
          </h1>
        </div>
      )}

      {/* Modals */}
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
          onClose={() => setIntelligenceOpen(false)}
        />
      )}
    </div>
  );
};

export default ServicesDropDown;