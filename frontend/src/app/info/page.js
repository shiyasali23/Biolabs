"use client";

import AboutUs from "@/components/AboutUs";
import { useUser } from "@/contexts/userContext";

export default function Info() {
  const { isLogined } = useUser();
  return <main className="bio-page"><AboutUs isLogined={isLogined} /></main>;
}
