// Model definitions arrive as JSON strings and are read on every render; parse each distinct string once.
const parsed = new Map();
export function decode(value, fallback) {
  if (typeof value === 'object' && value !== null) return value;
  if (typeof value !== 'string') return fallback;
  if (!parsed.has(value)) {
    let result = null;
    try { result = JSON.parse(value); } catch {}
    if (parsed.size > 50) parsed.clear();
    parsed.set(value, result);
  }
  return parsed.get(value) ?? fallback;
}
export const featuresOf = model => decode(model?.feature_names, []);
export const mapsOf = model => decode(model?.feature_maps, {});
export function initialInputs(model, diagnosis, existing = {}) {
  const maps = mapsOf(model);
  const lower = Object.fromEntries(Object.entries(existing).map(([k,v]) => [k.toLowerCase(),v]));
  return Object.fromEntries(featuresOf(model).map(name => [name, lower[name.toLowerCase()] ?? (diagnosis && !maps[name] ? 0 : '')]));
}
export function fieldError(value, options) {
  if (value === '' || value == null) return 'Required';
  if (options) return Object.hasOwn(options, value) ? '' : 'Choose a listed value';
  return Number.isFinite(Number(value)) && Number(value) >= 0 ? '' : 'Enter a number of zero or greater';
}
export function selectedSymptoms(model, values) {
  const maps = mapsOf(model);
  return featuresOf(model).filter(name => !maps[name] && Number(values[name]) === 1);
}
export function readyToRun(model, values, diagnosis) {
  const names = featuresOf(model), maps = mapsOf(model);
  return names.length > 0 && names.every(name => !fieldError(values[name], maps[name])) && (!diagnosis || selectedSymptoms(model, values).length >= 5);
}
