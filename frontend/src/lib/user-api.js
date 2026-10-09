import { readJson } from "./http.js";
import { cacheManager } from "@/utils/cache-wroker";

//utils/DiagnosisDetectionUtils.js
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "/backend";

//---------------------User Data-----------------------------
export const updateUser = async (inputValues) => {
  const token = cacheManager.get("token");
  if (!token) {
    throw new Error("Something went wrong,");
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/user/update`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ data: inputValues }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await readJson(response);
    return result?.response || null;
  } catch (error) {
    console.error("Error updating user:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

//---------------------Additional details-----------------------------

export const updateDetails = async (inputValues) => {
  const token = cacheManager.get("token");
  if (!token) {
    throw new Error("Something went wrong,");
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/user/update`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ data: inputValues }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await readJson(response);
    return result?.response || null;
  } catch (error) {
    console.error("Error updating user:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

//---------------------Address-----------------------------
export const updateAdress = async (inputValues) => {
  const token = cacheManager.get("token");
  if (!token) {
    throw new Error("Something went wrong,");
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/user/update`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ data: inputValues }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await readJson(response);
    return result?.response || null;
  } catch (error) {
    console.error("Error updating user:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
//---------------------Biometrics-----------------------------

export const updateBiometrics = async (
  updatedBiochemicalsData,
  unExpiredBiometricsData
) => {
  const token = cacheManager.get("token");
  if (!token) {
    throw new Error("Something went wrong, token is missing");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/biometrics`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        data: {
          updatedBiochemicalsData: updatedBiochemicalsData,
          unExpiredBiometricsData: unExpiredBiometricsData,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await readJson(response);
    return result?.response || null;
  } catch (error) {
    console.error("Error updating biometrics:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
