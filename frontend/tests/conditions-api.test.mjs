import test from 'node:test';
import assert from 'node:assert/strict';
import { getConditions } from '../src/lib/biochemicals-api.js';

test('conditions skips empty requests and distinguishes no matches from failures', async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  let requests = 0;
  const errors = [];
  console.error = (...args) => errors.push(args);
  try {
    globalThis.fetch = async () => { requests++; throw new Error('Unexpected request'); };
    assert.deepEqual(await getConditions([]), []);
    assert.equal(requests, 0);

    globalThis.fetch = async () => new Response(JSON.stringify({
      message: 'No conditions found for the ids.', response: null,
    }), { status: 404 });
    assert.deepEqual(await getConditions([{ id: 1, is_hyper: true }]), []);
    assert.equal(errors.length, 0);

    globalThis.fetch = async () => new Response(JSON.stringify({message: 'Wrong route'}), { status: 404 });
    assert.equal(await getConditions([{ id: 1, is_hyper: true }]), null);
    assert.equal(errors.length, 1);

    globalThis.fetch = async () => { throw new Error('Connection refused'); };
    assert.equal(await getConditions([{ id: 1, is_hyper: true }]), null);
    assert.match(errors.at(-1)[1], /Connection refused/);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});
