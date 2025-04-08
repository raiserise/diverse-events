module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    allowImportExportEverywhere: true,
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    "new-cap": 0,
    "max-len": [
      "error",
      {
        code: 140,
        ignoreStrings: true, // Ignore string literals
        ignoreTemplateLiterals: true, // Ignore backtick strings
        ignoreUrls: true, // Ignore URLs
        ignoreRegExpLiterals: true, // Ignore regex patterns
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
