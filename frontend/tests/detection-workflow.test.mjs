import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { updateMeasurement, outputsOf, completedInputs } from '../src/components/clinical-tools/detection-utils.mjs';
import { initialInputs, readyToRun } from '../src/components/clinical-tools/model-utils.mjs';
const models = JSON.parse(readFileSync(new URL('../src/jsons/dummy-disease-detection-data.json', import.meta.url))).models;
const samples = () => Object.fromEntries(models.map(model => [model.id, {...model.sample.inputs}]));
test('shared subject data stays consistent, and invalid shared values block both models', () => {
  const original = samples();
  const updated = updateMeasurement(models, original, {}, models[0].id, 'Age', -1);
  for (const model of models) {
    assert.equal(updated[model.id].Age, -1);
    assert.equal(readyToRun(model, updated[model.id], false), false);
    assert.equal(original[model.id].Age, 46);
  }
});
test('a model-specific edit keeps the other model ready and unchanged', () => {
  const original = samples();
  const updated = updateMeasurement(models, original, {}, models[0].id, 'Hemoglobin A1c', '');
  assert.equal(readyToRun(models[0],updated[models[0].id],false),false);
  assert.equal(readyToRun(models[1],updated[models[1].id],false),true);
  assert.deepEqual(updated[models[1].id],original[models[1].id]);
});
test('shared measurements also fill a model that has not been opened yet', () => {
  const updated = updateMeasurement(models, {}, {}, models[0].id, 'Creatinine', 0.83);
  assert.equal(updated[models[1].id].Creatinine,0.83);
  assert.equal(updated[models[1].id].Albumin,'');
  assert.equal(completedInputs(models[1],updated[models[1].id]),1);
});
test('overview exposes all outputs from the actual model definitions', () => {
  assert.deepEqual(outputsOf(models[0]),['Negative','Positive']);
  assert.deepEqual(outputsOf(models[1]),['Healthy','Hepatitis','Fibrosis','Cirrhosis']);
  for (const model of models) assert.equal(completedInputs(model, initialInputs(model,false)),0);
});
