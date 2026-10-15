const BASE_URL = "https://badesolutions.com.ng";

// Public, indexable routes only. Route segments are case-sensitive and must
// match the folder names under src/app exactly.
const routes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/Pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/why-bade", changeFrequency: "monthly", priority: 0.8 },
  { path: "/About_Us", changeFrequency: "monthly", priority: 0.8 },
  { path: "/Careers", changeFrequency: "weekly", priority: 0.7 },
  { path: "/auth/SignUp", changeFrequency: "monthly", priority: 0.6 },
  { path: "/Login", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
