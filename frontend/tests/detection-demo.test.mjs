import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixtureUrl = new URL("../src/jsons/dummy-disease-detection-data.json", import.meta.url);
const fixture = JSON.parse(await readFile(fixtureUrl, "utf8"));

const requiredFeatures = {
  fgfdsz45667hfzd: [
    "Gender", "Age", "Blood Urea Nitrogen", "Creatinine", "Hemoglobin A1c",
    "Total Cholesterol", "Triglycerides", "HDL Cholesterol", "LDL Cholesterol",
    "Very Low-Density Lipoprotein", "BMI"
  ],
  gvghvg56456gfcf: [
    "Age", "Gender", "Albumin", "Alkaline Phosphatase", "Alanine Aminotransferase",
    "Aspartate Aminotransferase", "Bilirubin", "Cholinesterase", "Total Cholesterol",
    "Creatinine", "Gamma-Glutamyl Transferase", "Total Protein"
  ]
};

test("sample detection fixtures match the live model input contracts", () => {
  assert.equal(fixture.models.length, 2);
  for (const model of fixture.models) {
    const declared = JSON.parse(model.feature_names);
    assert.deepEqual(declared, requiredFeatures[model.id]);
    assert.deepEqual(Object.keys(model.sample.inputs), declared);
    assert.ok(Object.values(model.sample.inputs).every((value) => value !== "" && value != null));
  }
});

test("sample results use the frontend prediction response shape", () => {
  for (const model of fixture.models) {
    const labels = Object.keys(JSON.parse(model.output_maps));
    const { prediction, probabilities } = model.sample.result;
    assert.ok(labels.includes(prediction));
    assert.deepEqual(Object.keys(probabilities), labels);
    const total = Object.values(probabilities).reduce((sum, value) => sum + value, 0);
    assert.ok(Math.abs(total - 100) < 0.01);
  }
});
