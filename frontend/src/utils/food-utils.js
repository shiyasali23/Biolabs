// Maps detected food names (lowercase from the model) to dataset entries, keeping the dataset's casing,
// and returns the best-scoring match.
export const mapDetectedFoods = (detectedFoods, dataset, scoreKey) => {
  if (!Array.isArray(detectedFoods) || !Array.isArray(dataset)) return { mappedPredictedFoods: null, maxFood: null };
  const byName = new Map();
  for (const item of dataset) {
    const key = item?.name?.toLowerCase();
    if (key && !byName.has(key)) byName.set(key, item);
  }
  const mappedPredictedFoods = detectedFoods
    .map((detected) => (typeof detected === "string" ? byName.get(detected.toLowerCase()) : null))
    .filter(Boolean)
    .map((food) => ({ name: food.name, score: food[scoreKey] }));
  if (!mappedPredictedFoods.length) return { mappedPredictedFoods: null, maxFood: null };
  const maxFood = mappedPredictedFoods.reduce((max, food) => (food.score > max.score ? food : max)).name;
  return { mappedPredictedFoods, maxFood };
};
