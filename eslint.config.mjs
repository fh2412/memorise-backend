import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,  // Include Node.js globals
        ...globals.browser // Include browser globals if needed
      },
      ecmaVersion: 2020 // Ensures ES6+ features are supported
    }
  },
  pluginJs.configs.recommended
];
