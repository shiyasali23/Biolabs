import { BACKEND_API_URL, failure, request } from "./http.js";
import { cacheManager } from "@/utils/cache-wroker";

const requireToken = (message = "Something went wrong,") => {
  const token = cacheManager.get("token");
  if (!token) throw new Error(message);
  return token;
};

// Profile, health details and address all post partial updates to the same endpoint.
export const updateUser = async (inputValues) => {
  const result = await request(`${BACKEND_API_URL}/user/update`, { method: "POST", token: requireToken(), json: { data: inputValues } });
  if (!result.ok) { console.error("Error updating user:", failure(result)); return null; }
  return result.body?.response || null;
};

export const updateBiometrics = async (updatedBiochemicalsData, unExpiredBiometricsData) => {
  const result = await request(`${BACKEND_API_URL}/biometrics`, {
    method: "POST",
    token: requireToken("Something went wrong, token is missing"),
    json: { data: { updatedBiochemicalsData, unExpiredBiometricsData } },
  });
  if (!result.ok) { console.error("Error updating biometrics:", failure(result)); return null; }
  return result.body?.response || null;
};
