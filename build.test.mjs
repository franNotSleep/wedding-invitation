// node build.test.mjs
import assert from 'node:assert/strict';
import { slug, page } from './build.mjs';
assert.equal(slug('José V. López'), 'jose-v-lopez');
assert.equal(slug('  Crismari   Lisbeth '), 'crismari-lisbeth');
assert.equal(slug('Ñoño & Peña'), 'nono-pena');
assert.ok(page('Raul Ruiz', 'raul-ruiz').includes('840975379'));
for (const x of ['melky-photo', 'ludmila-perez']) assert.ok(!/840975379|Mesa de regalos|402-3326917/.test(page('X', x)));
console.log('ok');
