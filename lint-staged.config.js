// lint-staged.config.js
module.exports = {
  '**/*.{ts,tsx}': () => 'tsc -p tsconfig.json --noEmit',
  '**/*.{js,jsx,ts,tsx}': ['npm run lint:fix', 'git add --force'],
  '**/*.{js,ts,css,md,html,json}': ['prettier --write', 'git add --force'],
};
