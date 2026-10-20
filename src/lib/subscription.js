// When a business's subscription has ended: it runs to the END of its end date, Lagos time
// (same rule as the backend's lib/subscription.js, which locks logins and switches businesses
// off). Comparing with moment(endDate) used midnight at the START of the end date, so the
// renewal screen appeared a day early.

const LAGOS_OFFSET_MS = 60 * 60 * 1000; // West Africa Time, UTC+1, no daylight saving
const DAY_MS = 24 * 60 * 60 * 1000;

/** The first moment after the end date (00:00 the next day, Lagos), or null if unreadable. */
export function subscriptionEndsAt(endDate) {
  if (endDate === undefined || endDate === null || endDate === "") return null;
  const s = endDate instanceof Date ? endDate.toISOString() : String(endDate).trim();
  let y;
  let m;
  let d;
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (ymd) {
    [y, m, d] = [Number(ymd[1]), Number(ymd[2]), Number(ymd[3])];
  } else {
    const parsed = new Date(s);
    if (Number.isNaN(parsed.getTime())) return null;
    [y, m, d] = [parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate()];
  }
  return new Date(Date.UTC(y, m - 1, d + 1) - LAGOS_OFFSET_MS);
}

/** Has the subscription ended? No (or an unreadable) end date counts as not ended. */
export function isSubscriptionExpired(endDate, now = new Date()) {
  const endsAt = subscriptionEndsAt(endDate);
  return endsAt ? now.getTime() >= endsAt.getTime() : false;
}

/** "Subscription ends today" / "ends in N day(s)" / "has expired" (or "" with no end date). */
export function subscriptionLabel(endDate, now = new Date()) {
  const endsAt = subscriptionEndsAt(endDate);
  if (!endsAt) return "";
  const left = endsAt.getTime() - now.getTime();
  if (left <= 0) return "Subscription has expired.";
  const days = Math.ceil(left / DAY_MS) - 1; // whole days after today
  return days === 0 ? "Subscription ends today." : `Subscription ends in ${days} day(s)`;
}
