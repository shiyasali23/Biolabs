import { BACKEND_API_URL, request } from "./http.js";

// type: "authenticate" (sign in) or "signup".
export const authenticate = async (inputFields, type) => {
  const result = await request(`${BACKEND_API_URL}/${type}`, { method: "POST", json: { data: inputFields } });
  if (result.error) { console.error("Authentication error:", result.error); return { data: null, message: "Something went wrong" }; }
  if (!result.ok) return { data: null, message: result.status === 401 ? "Invalid credentials" : "Something went wrong" };
  return { data: result.body?.response || null, message: null };
};
