import { BACKEND_API_URL, failure, request } from "./http.js";
import { cacheManager } from "@/utils/cache-wroker";

const DETECTION_API_URL = process.env.NEXT_PUBLIC_DETECTION_API_URL || "/detection";

export const getFoodNutrients = async () => {
  const result = await request(`${BACKEND_API_URL}/food_nutrients`);
  if (!result.ok) { console.error("Error fetching food nutrients:", failure(result)); return null; }
  return result.body?.response || null;
};

export const detectFood = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const token = cacheManager.get("token");
  if (token) formData.append("token", token);
  const result = await request(`${DETECTION_API_URL}/detect`, { method: "POST", formData });
  if (!result.ok) { console.error("Error detecting food:", failure(result)); return { detectedFoods: null, message: "Something went wrong" }; }
  if (result.body?.response == null) return { detectedFoods: null, message: "No Food Detected. Try New" };
  return { detectedFoods: result.body.response, message: null };
};
