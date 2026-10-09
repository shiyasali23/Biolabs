import { readJson } from "./http.js";
import { cacheManager } from "@/utils/cache-wroker";

//utils/DiagnosisDetectionUtils.js
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "/backend";

//---------------------User Report-----------------------------
export const getRecords = async () => {
  const token = cacheManager.get("token");
  if (!token) {
    throw new Error("Something went wrong,");
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/records`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await readJson(response);
    return result?.response || null;
  } catch (error) {
    console.error("Error getting records:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const registerRecords = async (recordsData) => {
  const token = cacheManager.get("token");
  if (!token) {
    throw new Error("Something went wrong,");
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/records`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ data: recordsData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await readJson(response);
    return result?.response || null;
  } catch (error) {
    console.error("Error updating user records:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
