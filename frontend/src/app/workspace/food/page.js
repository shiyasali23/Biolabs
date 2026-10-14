"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Camera, X } from "lucide-react";
import { detectFood } from "@/lib/foods-api";
import { mapDetectedFoods } from "@/utils/food-utils";
import { processFoodsScore } from "@/utils/food-woker";
import { useFood } from "@/contexts/foodContext";
import { useUser } from "@/contexts/userContext";
import LoadingComponent from "@/components/LoadingComponent";
import FoodSearch from "@/components/FoodSearch";
import FoodNutrientList from "@/components/FoodNutrientList";
import FoodNutrientBarGraph from "@/components/FoodNutrientBarGraph";
import FoodsScores from "@/components/FoodsScores";
import FoodPredictionsBarGraph from "@/components/FoodPredictionsBarGraph";
import ErrorComponent from "@/components/ErrorComponent";
import dynamic from "next/dynamic";
import styles from "./food.module.css";

// Webcam + upload libraries load only when the Food Photo dialog opens (its frame has a fixed height).
const CameraModule = dynamic(() => import("@/components/CameraModule"), { ssr: false });

export default function Food() {
  const { nutrientsData, foodsData, foodNutrients, nutrientsFoods, foodNutrientsDataLoading, fetchFoodNutrients, foodNutriscoreData } = useFood();
  const { foodsScore } = useUser();
  const [predictedFoodsData, setPredictedFoodsData] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selection, setSelection] = useState(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [reveal, setReveal] = useState(0);
  useEffect(() => {
    if (!reveal) return;
    const detail = document.getElementById("nutrition-detail");
    detail?.focus({ preventScroll: true });
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    // Wait until the new composition has painted, otherwise the smooth scroll is cancelled mid-way.
    let inner = 0;
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => detail?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" })); });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, [reveal]);
  const processedFoodsScore = useMemo(() => foodsScore && foodsData ? processFoodsScore(foodsScore, foodsData) : null, [foodsScore, foodsData]);
  useEffect(() => { if (!foodNutriscoreData) fetchFoodNutrients(); }, [foodNutriscoreData, fetchFoodNutrients]);
  const selectItem = useCallback((name, isFood) => {
    const data = (isFood ? foodNutrients : nutrientsFoods)?.find(item => Object.keys(item)[0] === name);
    setSelection(data ? { name, isFood, data } : null);
  }, [foodNutrients, nutrientsFoods]);
  const selectAndReveal = useCallback((name, isFood) => {
    selectItem(name, isFood);
    setReveal(value => value + 1);
  }, [selectItem]);
  const handleImage = async image => {
    setMessage(null); setPredictionLoading(true); setPredictedFoodsData(null);
    try {
      const { detectedFoods, message: error } = await detectFood(image);
      if (!detectedFoods) { setMessage(error || "The image could not be analyzed. Try again."); return; }
      const { mappedPredictedFoods, maxFood } = processedFoodsScore ? mapDetectedFoods(detectedFoods, processedFoodsScore, "value") : mapDetectedFoods(detectedFoods, foodNutriscoreData, "nutriScore");
      if (mappedPredictedFoods?.length) { setPredictedFoodsData(mappedPredictedFoods); selectItem(maxFood, true); }
      else setMessage("No supported food detected. Try a clearer photo.");
    } catch { setMessage("Photo analysis is unavailable. Please try again."); }
    finally { setPredictionLoading(false); }
  };
  return <main className={`bio-page ${styles.page}`}><div className="bio-container">
    <header className={styles.heading}><h1>Nutrition</h1></header>
    {foodNutrientsDataLoading ? <LoadingComponent text="Loading nutrition data"/> : !foodsData || !nutrientsData ? <ErrorComponent heading="Nutrition Data Is Unavailable" buttonText="Try again" handleTryAgain={fetchFoodNutrients}/> : <>
      <div className={styles.searchRow}>
        <div className={styles.search}><FoodSearch nutrientsData={nutrientsData} foodsData={foodsData} handleSelectedItem={selectAndReveal}/></div>
        <Dialog.Root open={photoOpen} onOpenChange={setPhotoOpen}>
          <Dialog.Trigger asChild><button type="button" className={styles.photoButton} aria-label="Analyze food photo"><Camera size={19} strokeWidth={1.75} aria-hidden="true"/><span>Food Photo</span></button></Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className={styles.photoOverlay}/>
            <Dialog.Content className={styles.photoDialog} aria-describedby={undefined}>
              <header className={styles.photoHeader}><Dialog.Title>Food Photo</Dialog.Title><Dialog.Close className={styles.photoClose} aria-label="Close food photo"><X size={19}/></Dialog.Close></header>
              <div className={styles.photoBody}>
                <div className={styles.camera}><CameraModule handleImage={handleImage} predictionLoading={predictionLoading}/></div>
                {message && <p role="alert" className={styles.error}>{message}</p>}
                {predictedFoodsData && <div className={styles.photoResult}><FoodPredictionsBarGraph predictedFoodsData={predictedFoodsData} handleSelectedItem={(name,isFood)=>{setPhotoOpen(false);selectAndReveal(name,isFood);}} isNutriScore={!processedFoodsScore}/></div>}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <div className={styles.explorer}>
        <section className={styles.library} aria-label="Foods and nutrients"><div><h2>Foods</h2><FoodNutrientList itemsArray={foodsData} selectedItem={selection?.name} handleSelectedItem={selectAndReveal} isFood groupByCategory/></div><div><h2>Nutrients</h2><FoodNutrientList itemsArray={nutrientsData} selectedItem={selection?.name} handleSelectedItem={selectAndReveal} isFood={false} groupByCategory/></div></section>
        <section tabIndex={-1} id="nutrition-detail" className={`${styles.detail}${selection ? "" : ` ${styles.detailEmpty}`}`} aria-label="Nutrition composition" aria-live="polite">{selection ? <FoodNutrientBarGraph key={selection.name} selectedData={selection.data} isItemFood={selection.isFood}/> : <p className={styles.detailHint}>Choose a food or nutrient to see its composition.</p>}</section>
      </div>
      <section className={styles.recommendations} aria-label="Food recommendations"><FoodsScores processedFoodsScore={processedFoodsScore} handleSelectedItem={selectAndReveal}/></section>
    </>}
  </div></main>;
}
