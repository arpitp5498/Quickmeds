const { readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const tests = readdirSync(path.join(root, 'tests')).filter(file => file.endsWith('.test.js')).map(file => path.join(root, 'tests', file));
if (!process.env.QUICKMEDS_TEST_MONGODB_URI) throw new Error('Set QUICKMEDS_TEST_MONGODB_URI to a disposable replica-set database before running integration tests');
const result = spawnSync(process.execPath, [require.resolve('jest/bin/jest'), '--runInBand', '--runTestsByPath', ...tests, ...process.argv.slice(2)], {
  cwd: root, stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'test', MONGODB_URI: process.env.QUICKMEDS_TEST_MONGODB_URI, JWT_SECRET: 'unit-test-only-isolated-signing-key' }
});
process.exitCode = result.status ?? 1;
