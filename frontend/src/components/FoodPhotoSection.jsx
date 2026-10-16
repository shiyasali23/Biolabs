"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { detectFood } from "@/lib/foods-api";
import { mapDetectedFoods } from "@/utils/food-utils";
import { processFoodsScore } from "@/utils/food-woker";
import { useFood } from "@/contexts/foodContext";
import { useUser } from "@/contexts/userContext";
import CameraModule from "./CameraModule";
import FoodPredictionsBarGraph from "./FoodPredictionsBarGraph";
import FoodNutrientBarGraph from "./FoodNutrientBarGraph";
import styles from "./FoodPhotoSection.module.css";

// Brings a block into view after an action changes it (instant under reduced motion).
const reveal = (element, block = "start") => element?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block });

export default function FoodPhotoSection() {
  const { foodsData, foodNutrients, foodNutriscoreData, fetchFoodNutrients } = useFood();
  const { foodsScore } = useUser();
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selection, setSelection] = useState(null);
  const sectionRef = useRef(null);
  const resultsRef = useRef(null);
  const detailRef = useRef(null);

  useEffect(() => { if (!foodNutriscoreData) fetchFoodNutrients(); }, [foodNutriscoreData, fetchFoodNutrients]);
  // When an analysis finishes, scroll to its result.
  useEffect(() => { if (predictions || message) reveal(resultsRef.current); }, [predictions, message]);
  const processedFoodsScore = useMemo(() => foodsScore && foodsData ? processFoodsScore(foodsScore, foodsData) : null, [foodsScore, foodsData]);

  const selectFood = useCallback(name => {
    const data = foodNutrients?.find(item => Object.keys(item)[0] === name);
    setSelection(data ? { name, data } : null);
  }, [foodNutrients]);

  const handleImage = async image => {
    setMessage(null); setPredictions(null); setSelection(null);
    if (!processedFoodsScore && !foodNutriscoreData) { setMessage("Nutrition data is unavailable right now. Please try again shortly."); return; }
    setLoading(true);
    try {
      const { detectedFoods, message: error } = await detectFood(image);
      if (!detectedFoods) { setMessage(error || "The image could not be analyzed. Try again."); return; }
      const { mappedPredictedFoods, maxFood } = processedFoodsScore ? mapDetectedFoods(detectedFoods, processedFoodsScore, "value") : mapDetectedFoods(detectedFoods, foodNutriscoreData, "nutriScore");
      if (mappedPredictedFoods?.length) { setPredictions(mappedPredictedFoods); selectFood(maxFood); }
      else setMessage("No supported food detected. Try a clearer photo.");
    } catch { setMessage("Photo analysis is unavailable. Please try again."); }
    finally { setLoading(false); }
  };

  return <section ref={sectionRef} id="food-photo" className={styles.section} aria-labelledby="food-photo-title">
    <header className={styles.heading}>
      <h2 id="food-photo-title">Food Photo</h2>
      <p>See how a meal fits your profile.</p>
    </header>
    <div className={`${styles.grid} ${predictions || message ? "" : styles.single}`}>
      <div className={styles.camera}><CameraModule handleImage={handleImage} predictionLoading={loading} onCameraOpen={() => reveal(sectionRef.current, "nearest")}/></div>
      {(predictions || message) && <div ref={resultsRef} className={styles.results} aria-live="polite">
        {message && <p role="alert" className={styles.error}>{message}</p>}
        {predictions && <FoodPredictionsBarGraph predictedFoodsData={predictions} handleSelectedItem={name => { selectFood(name); requestAnimationFrame(() => reveal(detailRef.current, "nearest")); }} isNutriScore={!processedFoodsScore}/>}
      </div>}
    </div>
    {selection && <div ref={detailRef} className={styles.detail}><FoodNutrientBarGraph key={selection.name} selectedData={selection.data} isItemFood/></div>}
  </section>;
}
