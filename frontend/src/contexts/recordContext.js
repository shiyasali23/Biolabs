"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getRecords, registerRecords } from "@/lib/vault-api";
import { cacheManager } from "@/utils/cache-wroker";
import dummyRecordsData from "@/jsons/dummy-records-data.json";

const RecordContext = createContext();

export const RecordProvider = ({ children }) => {
  const [recordsArray, setrecordsArray] = useState(null);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const fetchRecords = async () => {
    setRecordsLoading(true);
    const records = await getRecords();
    if (records) {
      setrecordsArray(records);
      cacheManager.set("records", records);
    }
    setRecordsLoading(false);
  };

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
          const updatedArray = [updatedRecord, ...prevRecords];
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

  const loadDummyRecords = async () => {
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
        fetchRecords,
        loadDummyRecords,
        fetchRecords
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
