"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/contexts/userContext";

import ErrorComponent from "./ErrorComponent";
import LoadingComponent from "./LoadingComponent";
import NoDataFound from "./NoDataFound";
import FoodsScoreBarGraph from "./FoodsScoreBarGraph";
import CustomButton from "./CustomButton";

const FoodsScores = ({ processedFoodsScore, handleSelectedItem }) => {
  const { latestBiometrics, userDataLoading, isLogined, handleAuthResponse } =
    useUser();
  const router = useRouter();
  const now = new Date();

  const currentDate = new Date().toISOString();

  const [expiredBiometrics,setExpiredBiometrics] = useState(latestBiometrics?.filter(({ expiryDate }) => expiryDate < currentDate) ||
  null);
    

  return (
    <div className="flex justify-center items-center min-h-[20vh] h-full w-full">
      {userDataLoading ? (
        <LoadingComponent text={"Loading Foods Score"} />
      ) : !isLogined ? (
        <NoDataFound isOpen={true} isModal={false} route={"food"} />
      ) : !processedFoodsScore ? (
        <ErrorComponent
          heading={"Get Personalized Food Recommendations"}
          buttonText={"Update Biochemicals"}
          handleTryAgain={() => router.push("/profile")}
        />
      ) : (
        <div className="flex w-full h-full">
          {!expiredBiometrics ? (
            <FoodsScoreBarGraph
              data={processedFoodsScore}
              handleSelectedItem={handleSelectedItem}
              expiredBiometrics={expiredBiometrics}
            />
          ) : (
            <div className=" h-full w-full flex items-center justify-center flex-col gap-3">
              <h1 className="text-center text-3xl font-semibold mb-10">Foods Scores Expired</h1>
              <CustomButton
                text={"Show Expired Foods Scores"}
                onClick={() =>
                  setExpiredBiometrics(null)
                }
              />
              <h1 className="text-center text-xl font-semibold">Or</h1>
              <CustomButton
                text={"Update Biochemicals"}
                onClick={() =>
                  router.push("/profile")
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodsScores;
