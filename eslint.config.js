import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "lucide-react", message: "Icons are banned in this codebase." },
            { name: "react-icons", message: "Icons are banned in this codebase." },
            { name: "@heroicons/react", message: "Icons are banned in this codebase." },
            { name: "@mui/icons-material", message: "Icons are banned in this codebase." },
            { name: "@tabler/icons-react", message: "Icons are banned in this codebase." },
            { name: "@radix-ui/react-icons", message: "Icons are banned in this codebase." }
          ],
          patterns: [
            "react-icons/*",
            "@heroicons/*",
            "@mui/icons-material/*",
            "@tabler/icons-*",
            "lucide-react/*",
            "@radix-ui/react-icons/*"
          ]
        }
      ],
    },
  }
);
