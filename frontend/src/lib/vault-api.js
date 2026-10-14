import { BACKEND_API_URL, failure, request } from "./http.js";
import { cacheManager } from "@/utils/cache-wroker";

const requireToken = () => {
  const token = cacheManager.get("token");
  if (!token) throw new Error("Something went wrong,");
  return token;
};

export const getRecords = async () => {
  const result = await request(`${BACKEND_API_URL}/records`, { token: requireToken() });
  if (!result.ok) { console.error("Error getting records:", failure(result)); return null; }
  return result.body?.response || null;
};

export const registerRecords = async (recordsData) => {
  const result = await request(`${BACKEND_API_URL}/records`, { method: "POST", token: requireToken(), json: { data: recordsData } });
  if (!result.ok) { console.error("Error updating user records:", failure(result)); return null; }
  return result.body?.response || null;
};
