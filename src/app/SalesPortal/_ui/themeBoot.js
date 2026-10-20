// Shared by the server layout (inline script) and theme.js (client), so not a client module.

export const THEME_KEY = "bade:sales-theme";

// Runs before the first paint: the same rule as theme.js apply() (saved choice, else the phone's setting).
// The landing page (/SalesPortal itself) is the original marketing page: always light.
export const LANDING_PATH = "/SalesPortal";
export const isLanding = (pathname) => String(pathname || "").replace(/\/+$/, "") === LANDING_PATH;

export const THEME_BOOT = `(function(){try{if(location.pathname.replace(/\\/+$/,"")===${JSON.stringify(LANDING_PATH)})return;var v=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=v==="dark"||(v!=="light"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("sp-dark","dark");}}catch(e){}})();`;
