// Shared by the server layout (inline script) and theme.js (client), so not a client module.

export const THEME_KEY = "bade:sales-theme";

// Runs before the first paint: the same rule as theme.js apply() (saved choice, else the phone's setting).
export const THEME_BOOT = `(function(){try{var v=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=v==="dark"||(v!=="light"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("sp-dark","dark");}}catch(e){}})();`;
