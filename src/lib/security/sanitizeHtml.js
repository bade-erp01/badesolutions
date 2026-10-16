// Sanitize HTML that genuinely has to be rendered as HTML (rare).
// For plain text, use escapeHtml or JSX instead; this is not a substitute.
import DOMPurify from "isomorphic-dompurify";

const CONFIG = {
  ALLOWED_TAGS: [
    "a", "b", "strong", "i", "em", "u", "s", "br", "p", "span", "div",
    "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
    "code", "pre", "hr", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "img",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "colspan", "rowspan", "target", "rel"],
  // Only http(s), mailto, tel and relative URLs.
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ["style", "script", "iframe", "svg", "math", "object", "embed", "form"],
  FORBID_ATTR: ["style"],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeHtml(dirty) {
  if (dirty === null || dirty === undefined) return "";
  return DOMPurify.sanitize(String(dirty), CONFIG);
}

export default sanitizeHtml;
