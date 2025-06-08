"use client";
import { useEffect, useState } from "react";

import AuthComponent from "@/components/AuthComponent";
import { useUser } from "@/contexts/userContext";
import AboutUs from "@/components/AboutUs";

const Health = () => {
  const { isLogined } = useUser();
  const [isUserLogined, setIsUserLogined] = useState(false);

  useEffect(() => {
    setIsUserLogined(isLogined);
  }, [isLogined]);

  return (
    <div className="w-screen h-screen flex flex-col">
     
      
    </div>
  );
};

export default Health;