"use client";

import { useData } from "@/contexts/dataContext";
import React from "react";
import { AiOutlineCloseSquare } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";

const CommingSoon = ({ isOpen, onClose, commingSoonIndex }) => {
  const { servicesArray } = useData();
  const service = servicesArray[commingSoonIndex];

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg w-[85vw] xl:w-[50vw] py-10 px-10 xl:px-20 transition-all duration-300 ">
        <FaTimes
          className="ml-auto   cursor-pointer text-3xl "
          onClick={onClose}
        />

        <div className="w-full h-full flex flex-col items-center justify-between gap-5 animate-dropdown ">
          <div className="w-full h-full flex flex-col items-center justify-center mt-10 gap-5">
            <h1 className=" text-3xl font-bold underline">
              {service[1]} {/* Service title */}
            </h1>
            <h1 className=" text-2xl font-bold underline">{service[3]}</h1>

            <h1 className=" text-sm font-semibold  leading-[2rem] text-center">
              {service[2]} {/* Long description */}
            </h1>
          </div>

          <div className="w-full h-full flex flex-col items-center justify-center">
            <h1 className=" text-2xl font-bold  animate-pulse-opacity">
              Comming Soon...
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommingSoon;
