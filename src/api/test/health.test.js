const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

test('package.json has a start script', () => {
  const pkg = require(path.join(__dirname, '..', 'package.json'));
  assert.ok(pkg.scripts, 'scripts section should exist');
  assert.strictEqual(typeof pkg.scripts.start, 'string');
  assert.ok(pkg.scripts.start.length > 0, 'start script should not be empty');
});
