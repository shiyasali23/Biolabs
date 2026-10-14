import { BACKEND_API_URL, failure, request } from "./http.js";

export const getBiochemicals = async () => {
  const result = await request(`${BACKEND_API_URL}/biochemicals`);
  if (!result.ok) { console.error("Error fetching biochemicals:", failure(result)); return null; }
  return result.body?.response || null;
};

export const getConditions = async (conditionsIds) => {
  if (Array.isArray(conditionsIds) && conditionsIds.length === 0) return [];
  const result = await request(`${BACKEND_API_URL}/conditions`, { method: "POST", json: { data: conditionsIds } });
  // The backend answers 404 when none of the ids have linked conditions; that is an empty result, not an error.
  if (result.status === 404 && result.body?.message === "No conditions found for the ids.") return [];
  if (!result.ok) { console.error("Error fetching conditions:", failure(result)); return null; }
  return result.body?.response || null;
};
