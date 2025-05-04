"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiMentalHealthFill } from "react-icons/ri";
import { AiFillSlackCircle } from "react-icons/ai";

import { useUser } from "@/contexts/userContext";
import ServicesDropDown from "./ServicesDropDown";
import Intelligence from "./Intelligence";

const Header = () => {
  const { logOutUser, isLogined } = useUser();
  const router = useRouter();
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);

  return (
    <header className="w-full sticky z-50 top-0 h-[8vh] xl:h-[12vh] xl:mb-2 flex justify-center items-center bg-white">
      {/* Logo section */}
      <div className=" flex xl:justify-center  w-full ">
        <Link href="/" className="flex items-center">
          <Image
            src="images/logo.svg"
            alt="Logo"
            width={75}
            height={75}
            className="xl:w-24 xl:h-24 w-14 h-14 "
          />
          <h1 className="xl:text-6xl text-2xl font-semibold xl:font-bold">
            Biolabs
          </h1>
        </Link>
      </div>

      {/* Right section */}
      <div className="absolute right-2 xl:right-10 flex items-center gap-2 xl:gap-16">
        <ServicesDropDown isLogined={isLogined} logOutUser={logOutUser} />
        <div className="flex items-center gap-3 xl:gap-10">
          
          {isLogined && (
            <div className="flex items-center flex-col">
            <RiMentalHealthFill
              className="cursor-pointer text-2xl xl:text-4xl font-bold"
              onClick={() => router.push("/profile")}
            />
            <h1 className="text-xs font-semibold">Profile</h1>
          </div>
          )}

          <div className="flex items-center flex-col">
            <AiFillSlackCircle
              className="cursor-pointer text-2xl xl:text-4xl font-bold"
              onClick={() => setIntelligenceOpen(true)}
            />
            <h1 className="text-xs font-semibold">Intelligence</h1>
          </div>
        </div>
      </div>
      {intelligenceOpen && (
        <Intelligence
          isOpen={intelligenceOpen}
          onClose={() => setIntelligenceOpen(false)}
          text=""
          extractedTexts={[]}
        />
      )}
    </header>
  );
};

export default Header;
