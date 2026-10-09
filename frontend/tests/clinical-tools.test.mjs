import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialInputs, readyToRun, selectedSymptoms, fieldError, featuresOf } from '../src/components/clinical-tools/model-utils.mjs';
const fixture = name => JSON.parse(readFileSync(new URL(`../src/jsons/${name}.json`, import.meta.url)));
const diagnosis = fixture('diagnosis-model-schema');
const detection = fixture('dummy-disease-detection-data').models;

test('every detection sample meets its actual model contract; missing values block submission', () => {
  for (const model of detection) {
    assert.equal(readyToRun(model, model.sample.inputs, false), true);
    for (const name of featuresOf(model)) {
      assert.equal(readyToRun(model, {...model.sample.inputs, [name]: ''}, false), false, name);
    }
  }
});
test('diagnosis requires five symptoms independently of mapped personal context', () => {
  const inputs = initialInputs(diagnosis, true);
  inputs.Gender = 'female';
  const symptoms = ['Fatigue', 'Weight Gain', 'Constipation', 'Lack of Concentration', 'Puffy Face and Eyes'];
  symptoms.slice(0,4).forEach(name => { inputs[name] = 1; });
  assert.equal(selectedSymptoms(diagnosis, inputs).length, 4);
  assert.equal(readyToRun(diagnosis, inputs, true), false);
  inputs[symptoms[4]] = 1;
  assert.equal(readyToRun(diagnosis, inputs, true), true);
  inputs.Gender = '';
  assert.equal(readyToRun(diagnosis, inputs, true), false);
});
test('invalid numbers and categorical values cannot be submitted', () => {
  for (const value of ['', null, undefined, -1, Infinity, 'abc']) assert.ok(fieldError(value));
  for (const value of [0, '0', '5.4']) assert.equal(fieldError(value), '');
  assert.ok(fieldError('unknown', {male:0, female:1}));
});
test('existing values are mapped without turning missing measurements into zero', () => {
  const values = initialInputs(detection[0], false, {age:46, gender:'female', BMI:0});
  assert.equal(values.Age,46);
  assert.equal(values.BMI,0);
  assert.equal(values.Creatinine,'');
  assert.equal(readyToRun(detection[0],values,false),false);
});
