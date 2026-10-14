"use client";
import { headingCase } from "@/lib/heading-case";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownRight, Apple, Check, FolderHeart, Sparkles, Microscope, Minus, Play, Loader2, ChevronDown } from "lucide-react";
import { useUser } from "@/contexts/userContext";
import BrandLogo from "@/components/BrandLogo";
import DiseaseDetectionModal from "@/components/DiseaseDetectionModal";
import dynamic from "next/dynamic";
import { getBiometricEntry } from "@/utils/analytics-utils";
import { rangeStatus, statusLabels, formatNumber } from "@/lib/clinical-display";
import styles from "./page.module.css";

// Camera, upload and chart code (chart.js) load only when a member view needs them; guests never download them.
const FoodPhotoSection = dynamic(() => import("@/components/FoodPhotoSection"), { ssr: false });
const HealthScoreGraph = dynamic(() => import("@/components/HealthScoreGraph"), { ssr: false });
const BiometricsEntryModal = dynamic(() => import("@/components/BiometricsEntryModal"), { ssr: false });

const FOOD_GROUPS = [
  ["Fruit", ["Strawberry", "Blueberry", "Raspberry", "Orange", "Lime", "Mandarin", "Banana", "Mango", "Pineapple", "Guava", "Kiwi", "Peach", "Plum", "Apricot", "Cherry", "Watermelon", "Muskmelon", "Apple", "Pear"]],
  ["Vegetables & herbs", ["Spinach", "Kale", "Lettuce", "Broccoli", "Cauliflower", "Cabbage", "Green Peas", "Carrots", "Sweet Potatoes", "Beets", "Radishes", "Potatoes", "Yams", "Cassava", "Butternut Squash", "Zucchini", "Pumpkin", "Cucumber", "Tomatoes", "Bell Peppers", "Eggplants", "Garlic", "Onion", "Chives", "Celery", "Asparagus", "Fennel", "Basil", "Cilantro", "Parsley", "Mint", "Thyme", "Rosemary", "Oregano", "Ginger", "Turmeric", "Horseradish", "Button Mushrooms", "Shiitake Mushrooms", "Portobello Mushrooms", "Oyster Mushrooms", "Alfalfa Sprouts", "Bean Sprouts", "Broccoli Sprouts"]],
  ["Nuts & seeds", ["Almond", "Cashew", "Chestnut", "Hazelnut", "Pistachio", "Walnut", "Pine Nut", "Sunflower Seed", "Pumpkin Seed", "Chia Seed", "Flax Seed", "Sesame Seed"]],
  ["Grains & legumes", ["Lentils", "Chickpeas", "Kidney Beans", "Wheat", "Rice", "Corn", "Barley", "Oats", "Millet", "Oatmeal"]],
  ["Seafood", ["Salmon", "Mackerel", "Sardines", "Tuna", "Cod", "Haddock", "Tilapia", "Halibut", "Pollock", "Shrimp", "Crab", "Oysters", "Lobster", "Mussels"]],
  ["Protein", ["Chicken", "Beef", "Lamb", "Pork", "Bacon", "Sausage", "Ham", "Salami", "Pepperoni", "Eggs"]],
  ["Dairy & alternatives", ["Whole Milk", "Almond Milk", "Soy Milk", "Cheddar", "Mozzarella", "Greek Yogurt", "Yogurt", "Butter", "Ghee"]],
  ["Drinks & prepared foods", ["Coffee", "Tea", "Lemonade", "Coca Cola", "Pepsi", "Beer", "Guacamole", "Salsa", "Popcorn", "Tacos", "Bread", "Crackers"]],
];

export default function Customer() {
  const { isLogined, isSample, loadDummyUserData, userDataLoading, latestBiometrics, healthScore, biometricsEntries, foodsScore } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [entry, setEntry] = useState(null);
  const [showAllNormal, setShowAllNormal] = useState(false);
  const [showAllFoods, setShowAllFoods] = useState(false);
  const busy = useRef(false);
  // The context restores from storage right after hydration, so "loading" is true on the server and for the
  // first client frame. Only show the loading notice for loads that start after that restore (sample, sign-in);
  // otherwise it renders in the server HTML and vanishes at once, shifting everything below it.
  const [restored, setRestored] = useState(false);
  useEffect(() => { if (!userDataLoading) setRestored(true); }, [userDataLoading]);
  const ready = isLogined || isSample;
  const rows = ready ? latestBiometrics || [] : [];
  const recommendedFoods = useMemo(() => {
    if (!ready || !foodsScore) return [];
    try {
      const scores = typeof foodsScore === "string" ? JSON.parse(foodsScore) : foodsScore;
      return Object.entries(scores)
        .filter(([, score]) => Number.isFinite(Number(score)))
        .sort(([, first], [, second]) => Number(second) - Number(first))
        .map(([name], index) => ({ name, rank: index + 1 }));
    } catch {
      return [];
    }
  }, [foodsScore, ready]);
  const recommendationGroups = useMemo(() => FOOD_GROUPS.map(([name, foods]) => ({
    name,
    foods: recommendedFoods.filter(food => foods.includes(food.name)).slice(0, 4),
  })).filter(group => group.foods.length), [recommendedFoods]);
  const groups = [["high", "Above Range"], ["low", "Below Range"], ["normal", "Within Range"], ["unknown", "Without A Reference Range"]];

  const startSample = useCallback(async (immediate = false) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true); setError("");
    try {
      if (!immediate) await new Promise(resolve => setTimeout(resolve, 650));
      if (!await loadDummyUserData()) throw new Error();
    }
    catch { setError("We couldn’t load the sample. Please try again."); }
    finally { busy.current = false; setLoading(false); }
  }, [loadDummyUserData]);
  useEffect(() => {
    if (userDataLoading || isLogined || isSample || busy.current) return;
    if (new URLSearchParams(window.location.search).get("sample") === "1") startSample(true);
  }, [isLogined, isSample, startSample, userDataLoading]);
  function openEntry(timestamp) {
    setEntry(getBiometricEntry(new Map((biometricsEntries || []).map(item => [item.created_at, item])), timestamp));
  }

  return <div className={styles.page}>
    <header className={styles.header}>
      <BrandLogo className={styles.brand} priority />
      <Link className={styles.account} href={isLogined ? "/profile" : "/sign-in?next=/customer"}>{isLogined ? "Your profile" : "Sign in"}<ArrowUpRight size={16}/></Link>
    </header>
    <main id="customer-content" className={styles.main}>
      {/* Guest and member views are separate subtrees: a cached session swaps one for the other right after
          hydration, and replacing nodes (rather than pushing the same nodes down) causes no layout shift. */}
      <Fragment key={ready ? "member" : "guest"}>
      {!isLogined && !isSample && <section id="get-started" className={styles.welcome} aria-label="Get started">
        <div><h2>{isSample ? "Sample Results" : "Explore With Sample Data"}</h2><p>{isSample ? "Demo data · not your medical records" : "No account needed."}</p></div>
        <div className={styles.actions}>{!isSample && <button className={`${styles.primary} ${styles.sampleButton}`} disabled={loading || userDataLoading} aria-busy={loading} onClick={() => startSample()}><span className={styles.launchIcon} aria-hidden="true">{loading ? <Loader2 size={18}/> : <Play size={16} fill="currentColor"/>}</span><span>{loading ? "Loading sample…" : "Try sample data"}</span><ArrowRight size={18} aria-hidden="true"/></button>}<Link className={isSample ? styles.primary : styles.secondary} href="/sign-up?next=/customer">Create account<ArrowUpRight size={18}/></Link></div>
        {error && <p role="alert">{error}</p>}
      </section>}
      <div aria-live="polite">{restored && userDataLoading && <p className={styles.notice}>Loading your health information…</p>}</div>
      {ready && !userDataLoading && <div className={styles.loadedContent}>
        <section className={styles.score} aria-label="Health Score">
          <div className={styles.sectionHeading}><Link className={`${styles.textLink} ${styles.iconLink}`} href="/profile?tab=measurements" aria-label={isSample ? "Measurements" : "Add results"}><ArrowUpRight size={18} aria-hidden="true"/></Link></div>
          <div className={styles.chart}><HealthScoreGraph clean healthScore={healthScore} handleBiometricEntry={openEntry}/></div>
        </section>
        <section id="disease-detection" className={styles.detection} aria-label="Disease predictions"><DiseaseDetectionModal isOpen embedded customerView /></section>
        <section className={styles.results} aria-label="Biochemical results">
          {!rows.length && <div className={styles.empty}><h3>No Results Yet</h3><p>Add your first measurements to see them here.</p><Link className={styles.primary} href="/profile?tab=measurements">Add measurements<ArrowRight size={18}/></Link></div>}
          {groups.map(([status, title]) => {
            const items = rows.filter(item => rangeStatus(item) === status);
            const collapsible = status === "normal" && items.length > 2;
            const StatusIcon = status === "high" ? ArrowUpRight : status === "low" ? ArrowDownRight : status === "normal" ? Check : Minus;
            return items.length > 0 && <section key={status} className={styles.group}>
              <h3 className={styles.groupHeading} data-status={status}><span className={styles.groupIcon}><StatusIcon size={16} aria-hidden="true" /></span><span>{title}</span><span className={styles.groupRule} aria-hidden="true" /></h3>
              <div className={`${collapsible ? styles.resultReveal : ""} ${collapsible && !showAllNormal ? styles.resultRevealCollapsed : ""}`}>
                <div id={`customer-results-${status}`} className={`${styles.cards} ${status === "normal" ? styles.normalCards : ""}`}>
                  {items.map((item,index) => <article hidden={collapsible && !showAllNormal && index >= 4} key={`${item.name}-${index}`} className={`${styles.result} ${styles[status]}`}><div className={styles.resultTop}><h4>{headingCase(item.name)}</h4>{status === "high" ? <ArrowUpRight size={20} aria-hidden="true"/> : status === "low" ? <ArrowDownRight size={20} aria-hidden="true"/> : null}</div><p className={styles.value}>{formatNumber(item.value)} <span>{item.unit}</span></p><p className={styles.range}>Reference: {status === "unknown" ? "unavailable" : `${formatNumber(item.healthy_min)}–${formatNumber(item.healthy_max)} ${item.unit || ""}`}</p><span className={styles.status}>{statusLabels[status]}</span></article>)}
                </div>
                {collapsible && <div className={`${styles.disclosure} ${!showAllNormal ? styles.faded : ""}`}><button aria-expanded={showAllNormal} aria-controls="customer-results-normal" onClick={event => { if (showAllNormal) event.currentTarget.closest("section").scrollIntoView({behavior:"smooth",block:"start"}); setShowAllNormal(value => !value); }}>{showAllNormal ? "Show less" : `Show ${items.length - 2} more`}<ChevronDown size={18} aria-hidden="true" className={showAllNormal ? styles.chevronUp : ""}/></button></div>}
              </div>
            </section>;
          })}
        </section>
        {recommendedFoods.length > 0 && <section id="food-recommendations" className={styles.foodRecommendations} aria-labelledby="food-recommendations-title">
          <div className={styles.foodHeading}>
            <h2 id="food-recommendations-title">Food Recommendations</h2>
            <Link className={styles.textLink} href="/workspace/food">Explore nutrition<ArrowUpRight size={16}/></Link>
          </div>
          {!showAllFoods ? <div className={`${styles.foodReveal} ${styles.foodRevealCollapsed}`}>
          <ol id="customer-food-recommendations" className={styles.foodList}>
            {recommendedFoods.slice(0, 8).map((food, index) => <li key={food.name} className={index === 0 ? styles.foodLead : ""}>
              <span className={styles.foodRank}>{String(food.rank).padStart(2, "0")}</span>
              <span className={styles.foodName}>{food.name}</span>
              {index === 0 && <span className={styles.foodNote}>Top match</span>}
            </li>)}
          </ol>
          <div className={styles.foodDisclosure}><button type="button" aria-expanded="false" aria-controls="customer-food-categories" onClick={() => setShowAllFoods(true)}>Browse by category<ChevronDown size={18} aria-hidden="true"/></button></div>
          </div> : <div id="customer-food-categories" className={styles.foodCategories}>
            {recommendationGroups.map(group => <section key={group.name} className={styles.foodCategory}>
              <div className={styles.foodCategoryHeading}><h3>{headingCase(group.name)}</h3></div>
              <ol>{group.foods.map(food => <li key={food.name}><span>{String(food.rank).padStart(2, "0")}</span><strong>{food.name}</strong></li>)}</ol>
            </section>)}
            <div className={styles.foodDisclosure}><button type="button" aria-expanded="true" aria-controls="customer-food-categories" onClick={() => { setShowAllFoods(false); document.getElementById("food-recommendations")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Show top picks<ChevronDown size={18} aria-hidden="true" className={styles.chevronUp}/></button></div>
          </div>}
          <p className={styles.foodContext}>This is a relative ranking, not a health score or medical prescription.</p>
        </section>}
        <FoodPhotoSection/>
      </div>}
      <nav className={styles.tools} aria-label="Health tools"><div className={styles.toolLinks}>{[[ready ? "#disease-detection" : "#get-started","Disease detection",Microscope],[ready && recommendedFoods.length ? "#food-recommendations" : "/workspace/food","Food & nutrition",Apple],["/workspace/vault","Records",FolderHeart],["/workspace/vault?intelligence=true","Intelligence",Sparkles]].map(([href,title,Icon]) => <Link key={title} href={href}><Icon size={22}/><div>{title}</div><ArrowUpRight size={18}/></Link>)}</div></nav>
      {ready && <p className={styles.footer}>Reference-range flags are not diagnoses.</p>}
      </Fragment>
    </main>
    {entry && <BiometricsEntryModal isOpen onClose={() => setEntry(null)} selectedBiometricEntry={entry}/>}
  </div>;
}
