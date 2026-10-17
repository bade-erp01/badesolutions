import { serverApi } from "../src/lib/serverApi";

// The logged-in user and business, from the backend's session (the httpOnly bade_sid
// cookie is forwarded). It used to trust browser cookies and read MongoDB directly,
// which anyone could forge.
//
// No try/catch here: serverApi never throws for network or HTTP errors, and the only
// thing it can throw is Next's "this page reads cookies, render it per request" signal,
// which must reach Next (swallowing it made /Login look static and broke the build).
// Not a server action ("use server"): it is only called from server components.
const fetchUser = async () => {
  const r = await serverApi("/api/v1/Session?full=1");
  if (r.status === 0) return { error: "Can't reach the server, please try again." };
  if (r.status === 401) return { error: "Session expired, please log in again." };
  if (!r.ok || !r.data?.user || !r.data?.business) {
    return { error: "User or Business information not found." };
  }
  return { user: r.data.user, business: r.data.business };
};

export { fetchUser };
