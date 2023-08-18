// lint-staged.config.js
module.exports = {
  '**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit'
}
