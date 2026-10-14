"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getRecords, registerRecords } from "@/lib/vault-api";
import { cacheManager } from "@/utils/cache-wroker";

const RecordContext = createContext();

export const RecordProvider = ({ children }) => {
  const [recordsArray, setrecordsArray] = useState(null);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    const records = await getRecords().catch(() => null);
    if (Array.isArray(records)) {
      setrecordsArray(records);
      cacheManager.set("records", records);
    }
    setRecordsLoading(false);
  }, []);

  useEffect(() => {

    setRecordsLoading(true);
    const cachedRecords = cacheManager.get("records");

    if (cachedRecords && Array.isArray(cachedRecords)) {
      setrecordsArray(cachedRecords);
    }
    setRecordsLoading(false);
  }, []);

  const updateRecord = async (reportData) => {
    try {
      setRecordsLoading(true);

      const updatedRecord = await registerRecords(reportData);

      if (updatedRecord) {
        setrecordsArray((prevRecords) => {
          const updatedArray = [updatedRecord, ...(prevRecords ?? [])];
          cacheManager.set("records", updatedArray);
          return updatedArray;
        });
        return { message: "", data: true };
      } else {
        return { message: "Something went wrong", data: null };
      }
    } catch (error) {
      return { message: "Something went wrong", data: null };
    } finally {
      setRecordsLoading(false);
    }
  };

  // Drop records held in memory when the session changes.
  const resetRecords = useCallback(() => setrecordsArray(null), []);

  const loadDummyRecords = async () => {
    // Loaded on demand so the sample records are not shipped with every page.
    const { default: dummyRecordsData } = await import("@/jsons/dummy-records-data.json");
    if (!dummyRecordsData) return false;
    setrecordsArray([dummyRecordsData]);
    return true;
  };

  return (
    <RecordContext.Provider
      value={{
        recordsArray,
        recordsLoading,
        updateRecord,
        loadDummyRecords,
        fetchRecords,
        resetRecords,
      }}
    >
      {children}
    </RecordContext.Provider>
  );
};

export const useRecord = () => {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error("useRecord must be used within a RecordProvider");
  }
  return context;
};
