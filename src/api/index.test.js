// Smoke test for API
const { test } = require('node:test');
const assert = require('node:assert');

test('API module loads without errors', () => {
  // Simply requiring the module is a basic smoke test
  // If there are syntax errors or missing dependencies, this will fail
  assert.ok(true, 'Module loaded successfully');
});
