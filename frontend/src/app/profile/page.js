"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageToolbar from "@/components/PageToolbar";
import BiochemicalsUpdate from "@/components/BiochemicalsUpdate";
import LatestBiometricsTable from "@/components/LatestBiometricsTable";
import LoadingComponent from "@/components/LoadingComponent";
import NoDataFound from "@/components/NoDataFound";
import UserDataComponent from "@/components/UserDataComponent";
import { useUser } from "@/contexts/userContext";
function Profile() {
  const {isLogined,isSample,userDataLoading,latestBiometrics,biometrics}=useUser();
  const params=useSearchParams(); const measurements=params.get("tab")==="measurements";
  if(userDataLoading)return <LoadingComponent text="Loading your profile"/>;
  if(!isLogined&&!isSample)return <NoDataFound isOpen route="profile"/>;
  return <main className="bio-page pb-16"><div className="bio-container"><PageToolbar title="Profile"/><nav className="bio-tabs" aria-label="Profile sections"><Link href="/profile" aria-current={!measurements?"page":undefined}>Personal details</Link><Link href="/profile?tab=measurements" aria-current={measurements?"page":undefined}>Measurements</Link></nav>{measurements ? <><LatestBiometricsTable latestBiometrics={latestBiometrics||[]} biometrics={biometrics} editable showSummary/>{!isSample&&<div className="mt-10"><BiochemicalsUpdate/></div>}</> : <UserDataComponent/>}</div></main>;
}
export default function ProfilePage(){return <Suspense fallback={<LoadingComponent text="Loading profile"/>}><Profile/></Suspense>;}
