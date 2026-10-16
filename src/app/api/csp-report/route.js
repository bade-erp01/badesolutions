// Receives CSP violation reports (report-uri and the Reporting API's report-to)
// and logs them, so the policy can be tuned while in Report-Only mode.
import { NextResponse } from "next/server";

const MAX_BODY = 16 * 1024;

function summarize(report) {
  // report-uri: { "csp-report": { "violated-directive": ... } }
  // report-to:  [{ type: "csp-violation", body: { effectiveDirective: ... } }]
  const r = report?.["csp-report"] || report?.body || report || {};
  return {
    directive: r["effective-directive"] || r.effectiveDirective || r["violated-directive"],
    blocked: r["blocked-uri"] || r.blockedURL,
    page: r["document-uri"] || r.documentURL,
    source: r["source-file"] || r.sourceFile,
    line: r["line-number"] || r.lineNumber,
    sample: r["script-sample"] || r.sample,
    disposition: r.disposition,
  };
}

export async function POST(request) {
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return new NextResponse(null, { status: 413 });

    const parsed = JSON.parse(text);
    const reports = Array.isArray(parsed) ? parsed : [parsed];
    for (const report of reports) {
      console.warn("[csp-violation]", JSON.stringify(summarize(report)));
    }
  } catch {
    // Malformed report: ignore.
  }
  return new NextResponse(null, { status: 204 });
}
