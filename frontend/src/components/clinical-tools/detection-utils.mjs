import { decode, featuresOf, initialInputs, mapsOf, fieldError } from './model-utils.mjs';

export const outputsOf = model => Object.keys(decode(model.output_maps, {}));
export const completedInputs = (model, values) => featuresOf(model).filter(name => !fieldError(values[name], mapsOf(model)[name])).length;

// Shared measurements describe the same subject in both models.
export function updateMeasurement(models, entries, existing, modelId, name, value) {
  const next = { ...entries };
  for (const model of models) {
    if (model.id === modelId || featuresOf(model).includes(name)) {
      next[model.id] = { ...(entries[model.id] || initialInputs(model, false, existing)), [name]: value };
    }
  }
  return next;
}
export function scoreText(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : 'Unavailable';
}
