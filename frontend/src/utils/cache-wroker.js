// localStorage cache for the keys the app owns. Storage can be missing (server render) or throw
// (private mode, quota), so every access is guarded and failures read as "not cached".
const CACHE_KEYS = new Set([
  "biochemicals",
  "foodNutrients",
  "nutrientsFoods",
  "foodsData",
  "nutrientsData",
  "foodNutriscoreData",

  "token",
  "userData",
  "healthScore",
  "biometrics",
  "latestBiometrics",
  "hyperBiochemicals",
  "hypoBiochemicals",
  "biometricsEntries",

  "foodsScore",

  "records",
]);

const storage = () => (typeof window === "undefined" ? null : window.localStorage);

export const cacheManager = {
  get(key) {
    if (!CACHE_KEYS.has(key)) return null;
    try {
      const item = storage()?.getItem(key);
      if (!item) return null;
      return key === "token" ? item : JSON.parse(item);
    } catch {
      return null;
    }
  },

  set(key, value) {
    if (!CACHE_KEYS.has(key)) return;
    try {
      storage()?.setItem(key, key === "token" ? value : JSON.stringify(value));
    } catch {}
  },

  clear(key) {
    if (!CACHE_KEYS.has(key)) return;
    try {
      storage()?.removeItem(key);
    } catch {}
  },

  multiGet: (keys) => Object.fromEntries(keys.map((key) => [key, cacheManager.get(key)])),
  multiSet: (data) => Object.entries(data).forEach(([key, value]) => cacheManager.set(key, value)),
  clearAll: () => CACHE_KEYS.forEach((key) => cacheManager.clear(key)),
};
