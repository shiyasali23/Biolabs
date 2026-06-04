// @/utils/cache-worker.js

const validCacheKeys = [
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
];

const isLocalStorageAvailable = () => {
  try {
    if (typeof window === "undefined") return false;
    // Accessing window.localStorage itself might throw in some constrained environments
    const storage = window.localStorage;
    if (!storage) return false;

    // Check if functions exist
    if (typeof storage.getItem !== "function") return false;
    if (typeof storage.setItem !== "function") return false;
    if (typeof storage.removeItem !== "function") return false;

    // Try to actually use it
    const testKey = "__ls_test__";
    storage.setItem(testKey, "test");
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    // console.warn("LocalStorage check failed:", e);
    return false;
  }
};

class CacheManager {
  constructor(validKeys = []) {
    this.validKeys = new Set(validKeys);
  }

  // Check if a key is valid for caching.
  isValidKey(key) {
    return this.validKeys.has(key);
  }

  // Retrieve a single key from localStorage.
  get(key) {
    if (!this.isValidKey(key)) return null;
    if (!isLocalStorageAvailable()) return null;

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;
      return key === "token" ? item : JSON.parse(item);
    } catch (error) {
      return null;
    }
  }

  set(key, value) {
    if (!this.isValidKey(key)) return;
    if (!isLocalStorageAvailable()) return;

    try {
      if (key === "token") {
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      return;
    }
  }

  multiGet(keys) {
    const result = {};
    keys.forEach((key) => {
      result[key] = this.get(key);
    });
    return result;
  }

  // Set multiple keys in localStorage at once.
  multiSet(data) {
    Object.keys(data).forEach((key) => {
      if (this.isValidKey(key)) {
        this.set(key, data[key]);
      }
    });
  }

  clear(key) {
    if (!this.isValidKey(key)) return;
    if (!isLocalStorageAvailable()) return;

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      return;
    }
  }

  clearAll() {
    this.validKeys.forEach((key) => {
      this.clear(key);
    });
  }
}

export const cacheManager = new CacheManager(validCacheKeys);
