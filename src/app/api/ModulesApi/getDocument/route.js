import getDocumentById from '../../../../../lib/getSingleDocument'

export async function GET(req) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Extract query parameters using URL and searchParams
  const url = new URL(req.url);
  const moduleList = url.searchParams.get("module");
  const document = url.searchParams.get("document");
  const tenantId = url.searchParams.get("tenantId");

  if (!document || !moduleList) {
    return new Response(JSON.stringify({ error: "Something went wrong...🥵🥵" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  //  fetching module data
  const moduleData =  await getDocumentById(moduleList,tenantId,document)

  return new Response(JSON.stringify(moduleList), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
