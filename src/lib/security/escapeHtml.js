// Escape a value for interpolation into an HTML string (text or quoted attribute).
//
// Use this on EVERY value that goes into a template-string HTML sink
// (Swal `html`/`title`, innerHTML, document.write). Never use it on
// fragments that are already HTML (e.g. the output of a row generator);
// escape the leaf values that went into those fragments instead.
//
// Prefer JSX where possible: React escapes text automatically.

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPES[ch]);
}

export default escapeHtml;
