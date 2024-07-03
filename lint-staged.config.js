module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'eslint', 'prettier --write'],
  '**/*.ts?(x)': () => 'npm run check-types',
  '**/*.spec.ts': ['vitest run', 'vitest run --config ./vitest.config.e2e.ts'],
  '*.{json,yaml}': ['prettier --write'],
}
