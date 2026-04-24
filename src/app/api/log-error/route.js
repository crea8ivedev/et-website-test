export const dynamic = "force-dynamic";

export async function POST(req) {
  let raw = "";
  try {
    raw = await req.text();
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {}
    // Logged to Vercel function logs — search by scope or digest in the dashboard.
    console.error("[client-error]", parsed || raw);
  } catch (e) {
    console.error("[client-error] relay failed", e, "raw:", raw);
  }
  return new Response(null, { status: 204 });
}
