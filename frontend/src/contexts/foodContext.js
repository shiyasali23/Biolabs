"use client";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { getFoodNutrients } from "@/lib/foods-api";
import { cacheManager } from "@/utils/cache-wroker";
import { processFoodNutrients } from "@/utils/food-woker";

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [foodNutrients, setFoodNutrients] = useState(null);
  const [nutrientsFoods, setNutrientsFoods] = useState(null);
  const [foodsData, setFoodsData] = useState(null);
  const [nutrientsData, setNutrientsData] = useState(null);
  const [foodNutriscoreData, setFoodNutriscoreData] = useState(null);
  const [foodNutrientsDataLoading, setFoodNutrientsDataLoading] =
    useState(true);


  const restored = useRef(false);
  // Called by the pages that need food data. The first call shows any cached copy immediately (no loading
  // state), then refreshes from the API; other pages never parse this cache.
  const fetchFoodNutrients = useCallback(async () => {
    let hasCache = false;
    if (!restored.current) {
      restored.current = true;
      const cached = cacheManager.multiGet(["foodNutrients", "nutrientsFoods", "foodsData", "nutrientsData", "foodNutriscoreData"]);
      hasCache = !!(cached.foodsData && cached.nutrientsData && cached.foodNutriscoreData);
      if (hasCache) {
        setFoodNutrients(cached.foodNutrients);
        setNutrientsFoods(cached.nutrientsFoods);
        setFoodsData(cached.foodsData);
        setNutrientsData(cached.nutrientsData);
        setFoodNutriscoreData(cached.foodNutriscoreData);
        setFoodNutrientsDataLoading(false);
      }
    }
    if (!hasCache) setFoodNutrientsDataLoading(true);
    const foodNutrientsData = await getFoodNutrients();
    if (foodNutrientsData) {
      const {
        foodNutrients,
        nutrientsFoods,
        foodsData,
        nutrientsData,
        foodNutriscoreData,
      } = processFoodNutrients(foodNutrientsData);

      cacheManager.multiSet({
        foodNutrients,
        nutrientsFoods,
        foodsData,
        nutrientsData,
        foodNutriscoreData,
      });

      setFoodNutrients(foodNutrients);
      setNutrientsFoods(nutrientsFoods);
      setFoodsData(foodsData);
      setNutrientsData(nutrientsData);
      setFoodNutriscoreData(foodNutriscoreData);
    }
    setFoodNutrientsDataLoading(false);
  }, []);

  return (
    <FoodContext.Provider
      value={{
        fetchFoodNutrients,
        foodNutrientsDataLoading,
        foodNutrients,
        nutrientsFoods,
        foodsData,
        nutrientsData,
        foodNutriscoreData,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error("useFood must be used within a FoodProvider");
  }
  return context;
};
