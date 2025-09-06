import getDataFromCollection from "../../../../lib/getTenantsModule"


export async function GET(req) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Extract query parameters using URL and searchParams
  const url = new URL(req.url);
  const module = url.searchParams.get("module");
  const tenantId = url.searchParams.get("tenantId");

  if (!module) {
    return new Response(JSON.stringify({ error: "Module query parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  //  fetching module data
  const moduleData =  await getDataFromCollection(module.toLocaleLowerCase(),tenantId)

  return new Response(JSON.stringify(moduleData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
