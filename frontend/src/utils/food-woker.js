const EMPTY = { foodNutrients: null, nutrientsFoods: null, foodsData: null, nutrientsData: null, foodNutriscoreData: null };

// Turns the flat /food_nutrients rows ({ food, nutrient, value }) into lookup tables for both directions
// (food -> nutrients, nutrient -> foods), the food and nutrient lists, and each food's nutri-score. One pass, O(n).
export const processFoodNutrients = (rawData) => {
  if (!Array.isArray(rawData) || rawData.length === 0) return EMPTY;
  const foodNutrients = new Map();
  const nutrientsFoods = new Map();
  const foodsData = new Map();
  const nutrientsData = new Map();
  for (const entry of rawData) {
    const { food, nutrient, value } = entry || {};
    if (!food?.name || !nutrient?.name) continue;
    const { name: foodName, category, subcategory: subCategory } = food;
    const { name: nutrientName, nutrient_category: nutrientCategory, unit } = nutrient;
    const foodKey = `${foodName}\u0000${category}\u0000${subCategory}`;
    if (!foodsData.has(foodKey)) foodsData.set(foodKey, { name: foodName, category, subCategory });
    const nutrientKey = `${nutrientName}\u0000${nutrientCategory}`;
    if (!nutrientsData.has(nutrientKey)) nutrientsData.set(nutrientKey, { name: nutrientName, category: nutrientCategory });
    if (!foodNutrients.has(foodName)) foodNutrients.set(foodName, { nutriScore: food.nutriscore, category, subCategory, associations: {} });
    foodNutrients.get(foodName).associations[nutrientName] = { value, unit, category: nutrientCategory };
    if (!nutrientsFoods.has(nutrientName)) nutrientsFoods.set(nutrientName, { category: nutrientCategory, unit, associations: {} });
    nutrientsFoods.get(nutrientName).associations[foodName] = { value, category, subcategory: subCategory };
  }
  return {
    foodNutrients: [...foodNutrients].map(([name, data]) => ({ [name]: data })),
    nutrientsFoods: [...nutrientsFoods].map(([name, data]) => ({ [name]: data })),
    foodsData: [...foodsData.values()],
    nutrientsData: [...nutrientsData.values()],
    foodNutriscoreData: [...foodNutrients].map(([name, data]) => ({ name, nutriScore: data.nutriScore })),
  };
};

export const processFoodsScore = (scoredData, mapData) => {

  
  // Parse scoredData if it's a string
  if (typeof scoredData === "string") {
    try { scoredData = JSON.parse(scoredData); } catch { return []; }
  }
  if (!scoredData || typeof scoredData !== "object" || !Array.isArray(mapData)) return [];

  // Convert mapData into a Map for O(1) lookup
  const nameToCategory = new Map(mapData.map(({ name, category }) => [name, category]));

  // Keep backend scores intact; rank foods from highest to lowest.
  const sortedEntries = Object.entries(scoredData)
    .filter(([, value]) => value !== null && value !== "" && Number.isFinite(Number(value)))
    .sort((a, b) => Number(b[1]) - Number(a[1]));

  // Construct the result array in a single loop (O(n))
  return sortedEntries.map(([name, value], index) => ({
      name,
      category: nameToCategory.get(name) || "unknown",
      value: Number(value),
      rank: index + 1
  }));
};

