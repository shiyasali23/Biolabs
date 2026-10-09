import test from 'node:test';
import assert from 'node:assert/strict';
import { rangeStatus, numeric, formatNumber } from '../src/lib/clinical-display.js';
import { processDummyUserData } from '../src/utils/dummy-data-worker.js';
test('range endpoints are inclusive and backend status does not override display',()=>{
 for(const value of [.4,4])assert.equal(rangeStatus({value,healthy_min:.4,healthy_max:4,isHyper:true}),'normal');
 assert.equal(rangeStatus({value:4.4,healthy_min:.4,healthy_max:4,isHyper:null}),'high');
 assert.equal(rangeStatus({value:.3,healthy_min:.4,healthy_max:4}),'low');
});
test('missing and invalid values are never classified as healthy',()=>{
 for(const value of ['',null,undefined,NaN,Infinity,false,' '])assert.equal(numeric(value),null);
 assert.equal(rangeStatus({value:0,healthy_min:0,healthy_max:1}),'normal');
 assert.equal(rangeStatus({value:3,healthy_min:4,healthy_max:1}),'unknown');
 assert.equal(rangeStatus({value:3,healthy_min:null,healthy_max:4}),'unknown');
});
test('numbers are legible and retain meaningful small values',()=>{
 assert.equal(formatNumber(25.000000000000007),'25');
 assert.equal(formatNumber(.000123), '0.000123');
 assert.equal(formatNumber(null),'—');
});
test('sample dates are deterministic and the source fixture is not mutated',()=>{
 const input=[{created_at:'original',biometrics:[{value:10,expiry_date:'original'}]}];
 const before=JSON.stringify(input);const result=processDummyUserData(input);
 assert.equal(JSON.stringify(input),before);
 assert.deepEqual(result,processDummyUserData(input));
 assert.ok(new Date(result[0].created_at)<new Date('2026-01-01'));
 assert.equal(result[0].biometrics[0].value,10);
});
