import { BACKEND_API_URL, failure, request } from "./http.js";
import { cacheManager } from "@/utils/cache-wroker";

const DIAGNOSIS_API_URL = process.env.NEXT_PUBLIC_DIAGNOSIS_API_URL || "/diagnosis";
const isObject = (value) => !!value && typeof value === "object";

// type: "diagnosis_model" (symptoms) or "disease_detections" (biochemical models).
export const getModels = async (type) => {
  const result = await request(`${DIAGNOSIS_API_URL}/get_features/${type}`);
  if (result.ok && Array.isArray(result.body?.response)) return result.body.response;
  console.error("Failed to fetch Diagnosis models:", failure(result));
  return [];
};

// Sample runs never send the signed-in user's token, so they are not stored against the account.
export const getDiseasePredictions = async (modelId, inputValues, { sample = false } = {}) => {
  const token = sample ? null : cacheManager.get("token");
  const result = await request(`${DIAGNOSIS_API_URL}/predict/${modelId}`, { method: "POST", json: { data: inputValues, ...(token && { token }) } });
  if (result.ok && isObject(result.body?.response)) return result.body.response;
  console.error("Failed to fetch Diagnosis predictions:", failure(result));
  return null;
};

// Symptom diagnosis: the model prediction, merged with the backend's report (description, medications, ...).
export const getDiagnosisPrediction = async (modelId, inputValues, options) => {
  const prediction = await getDiseasePredictions(modelId, inputValues, options);
  if (!prediction) return null;
  const report = await getDiagnosisReport(prediction.prediction);
  return isObject(report) ? { ...prediction, ...report } : prediction;
};

const getDiagnosisReport = async (disease) => {
  const result = await request(`${BACKEND_API_URL}/diseases`, { method: "POST", json: { data: disease } });
  if (result.ok && isObject(result.body?.response)) return result.body.response;
  console.error("Failed to fetch Diagnosis report:", failure(result));
  return null;
};
