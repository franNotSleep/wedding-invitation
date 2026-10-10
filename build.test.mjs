// node build.test.mjs
import assert from 'node:assert/strict';
import { slug } from './build.mjs';
assert.equal(slug('José V. López'), 'jose-v-lopez');
assert.equal(slug('  Crismari   Lisbeth '), 'crismari-lisbeth');
assert.equal(slug('Ñoño & Peña'), 'nono-pena');
console.log('ok');
