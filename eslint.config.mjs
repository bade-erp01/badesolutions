import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import noUnsanitized from "eslint-plugin-no-unsanitized";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals"],
    rules: {
      // 🔧 Disable specific rules
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      // Add more rules as needed
    },
  }),

  // XSS guard rails: API/user data must never run as code in the browser.
  // Render data through JSX (auto-escaped). Where an HTML string can't be
  // avoided (SweetAlert html, print windows), wrap every interpolated value in
  // escapeHtml() from src/lib/security, and pass data URLs through safeUrl().
  // no-unsanitized flags innerHTML/outerHTML/insertAdjacentHTML/document.write
  // with non-constant input; a reviewed, escaped sink can be allowed with an
  // eslint-disable-next-line comment that says why it is safe.
  noUnsanitized.configs.recommended,
  {
    rules: {
      "no-unsanitized/property": [
        "error",
        { escape: { methods: ["escapeHtml", "sanitizeHtml"] } },
      ],
      "no-unsanitized/method": [
        "error",
        { escape: { methods: ["escapeHtml", "sanitizeHtml"] } },
      ],
      "react/no-danger": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
    },
  },
];

export default eslintConfig;
