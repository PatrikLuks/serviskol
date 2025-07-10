// ESLint config for backend (migrace z .eslintrc.json)
export default [
  {
    ignores: ["node_modules/**"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module"
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn"
    }
  }
];
