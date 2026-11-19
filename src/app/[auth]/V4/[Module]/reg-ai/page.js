import { redirect } from "next/navigation";

// The Reg AI app tile (sidebar apps open /<business>/V4/<url>/<url>, here /V4/reg-ai/reg-ai):
// the assistant itself lives at /<business>/V4/Assistant.
export default async function RegAiApp({ params }) {
  const { auth } = await params;
  redirect(`/${encodeURIComponent(auth)}/V4/Assistant`);
}
