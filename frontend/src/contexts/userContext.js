"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { processBiometricData } from "@/utils/biometrics-worker";
import { cacheManager } from "@/utils/cache-wroker";
import { processDummyUserData } from "@/utils/dummy-data-worker";
import { useIsClient } from "@/hooks/useIsClient";

const UserContext = createContext();

// Per-user cache entries; reference data (biochemicals, foods) is shared and kept.
const USER_CACHE_KEYS = ["userData", "healthScore", "biometrics", "latestBiometrics", "hyperBiochemicals", "hypoBiochemicals", "biometricsEntries", "foodsScore", "records"];

export const UserProvider = ({ children }) => {
  const isClient = useIsClient();
  const [isLogined, setIsLogined] = useState(false);
  const [isSample, setIsSample] = useState(false);
  const [userData, setUserData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [biometrics, setBiometrics] = useState(null);
  const [biometricsEntries, setBiometricsEntries] = useState(null);
  const [latestBiometrics, setLatestBiometrics] = useState(null);
  const [hyperBiochemicals, setHyperBiochemicals] = useState(null);
  const [hypoBiochemicals, setHypoBiochemicals] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);

  const [foodsScore, setFoodsScore] = useState(null);

  const clearUserState = () => {
    setHealthScore(null);
    setBiometrics(null);
    setLatestBiometrics(null);
    setHyperBiochemicals(null);
    setHypoBiochemicals(null);
    setUserData(null);
    setBiometricsEntries(null);
    setFoodsScore(null);
  };

  const restoreFromCache = () => {
    const cachedData = cacheManager.multiGet([
      "token",
      "userData",
      "latestBiometrics",
      "healthScore",
      "biometrics",
      "biometricsEntries",
      "hyperBiochemicals",
      "hypoBiochemicals",

      "foodsScore",
    ]);

    if (cachedData.token && cachedData.userData) {
      setIsLogined(true);
      setUserData(cachedData.userData);
      setHealthScore(cachedData.healthScore);
      setBiometrics(cachedData.biometrics);
      setBiometricsEntries(cachedData.biometricsEntries);
      setLatestBiometrics(cachedData.latestBiometrics);
      setHyperBiochemicals(cachedData.hyperBiochemicals);
      setHypoBiochemicals(cachedData.hypoBiochemicals);

      setFoodsScore(cachedData.foodsScore);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!isClient) return;
    setUserDataLoading(true);
    restoreFromCache();
    setUserDataLoading(false);
    // restoreFromCache only reads storage and calls state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  const handleAuthResponse = async (data) => {
    setUserDataLoading(true);

    if (data.token && data.user) {
      // A new session must never inherit sample data or a previous user's records.
      setIsSample(false);
      clearUserState();
      USER_CACHE_KEYS.forEach((key) => cacheManager.clear(key));
      cacheManager.multiSet({
        token: data.token,
        userData: data.user,
      });
      setUserData(data.user);
      setIsLogined(true);
    }

    if (
      Array.isArray(data.biometrics_entries) &&
      data.biometrics_entries.length
    ) {
      setBiometricsEntries(data.biometrics_entries);

      // The processBiometricData now handles API calls internally and returns processed data
      const {
        healthScore,
        biometrics,
        latestBiometrics,
        hyperBiochemicals: processedHyperBiochemicals,
        hypoBiochemicals: processedHypoBiochemicals,
      } = await processBiometricData(data.biometrics_entries);
      setHealthScore(healthScore);
      setBiometrics(biometrics);
      setLatestBiometrics(latestBiometrics);
      setHyperBiochemicals(processedHyperBiochemicals);
      setHypoBiochemicals(processedHypoBiochemicals);

      // Cache all the processed data
      cacheManager.multiSet({
        biometricsEntries: data.biometrics_entries,
        healthScore,
        biometrics,
        latestBiometrics,
        hyperBiochemicals: processedHyperBiochemicals,
        hypoBiochemicals: processedHypoBiochemicals,
      });
    }

    if (data.foods_score?.foods_score) {
      setFoodsScore(data.foods_score.foods_score);
      cacheManager.multiSet({
        foodsScore: data.foods_score.foods_score,
      });
    }

    setUserDataLoading(false);
  };

  const handleUserdata = (data) => {
    setUserDataLoading(true);
    setUserData(data);
    // Sample edits stay in memory and are never written to the signed-in user's cache.
    if (!isSample) cacheManager.set("userData", data);
    setUserDataLoading(false);
  };

  const logOutUser = () => {
    setIsSample(false);
    setIsLogined(false);
    clearUserState();
    cacheManager.clearAll();
  };

  // Leaving the sample returns a signed-in user to their own data instead of signing them out.
  const exitSample = () => {
    setIsSample(false);
    clearUserState();
    if (!restoreFromCache()) setIsLogined(false);
  };

  // Sample workspace edits update the in-memory record only.
  const applySampleValues = (values) => {
    setLatestBiometrics((current) => current?.map((item) => values[item.id] !== undefined ? { ...item, value: values[item.id] } : item) ?? current);
  };

  const loadDummyUserData = async () => {
    // Loaded on demand so the sample dataset is not shipped with every page.
    const { default: dummyUserData } = await import("@/jsons/dummy-user-data.json");
    if (!dummyUserData) return false;

    if (!dummyUserData.user) return false;

    if (!dummyUserData.foods_score?.foods_score) return false;

    if (!dummyUserData.biometrics_entries) return false;

    const processedDummyData = processDummyUserData(
      dummyUserData.biometrics_entries
    );
    if (!processedDummyData) return false;

    const {
      healthScore,
      biometrics,
      latestBiometrics,
      hyperBiochemicals,
      hypoBiochemicals,
    } = await processBiometricData(processedDummyData);

    if (healthScore) setHealthScore(healthScore);
    if (biometrics) setBiometrics(biometrics);
    if (latestBiometrics) setLatestBiometrics(latestBiometrics);
    if (hyperBiochemicals) setHyperBiochemicals(hyperBiochemicals);
    if (hypoBiochemicals) setHypoBiochemicals(hypoBiochemicals);
    setBiometricsEntries(processedDummyData);
    setUserData(dummyUserData.user);
    setFoodsScore(dummyUserData.foods_score.foods_score);
    setIsSample(true);
    return true;
  };

  return (
    <UserContext.Provider
      value={{
        handleAuthResponse,
        logOutUser,
        exitSample,
        setUserDataLoading,
        handleUserdata,
        loadDummyUserData,
        isLogined,
        isSample,
        healthScore,
        userData,
        biometrics,
        biometricsEntries,
        latestBiometrics,
        applySampleValues,
        hyperBiochemicals,
        hypoBiochemicals,

        foodsScore,
        userDataLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
