export function decode(value, fallback) {
  if (typeof value === 'object' && value !== null) return value;
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
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
  return featuresOf(model).length > 0 && featuresOf(model).every(name => !fieldError(values[name], mapsOf(model)[name])) && (!diagnosis || selectedSymptoms(model, values).length >= 5);
}
