module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'eslint', 'prettier --write'],
  '**/*.ts?(x)': () => 'npm run check-types',
  '**/*.spec.ts': ['vitest run'],
  '*.{json,yaml}': ['prettier --write'],
}
