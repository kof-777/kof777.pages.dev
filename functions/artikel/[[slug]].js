export async function onRequest(context) {
  const { params, request } = context;
  const slug = params.slug;

  const url = new URL(request.url);
  const DOMAIN = url.origin;

  const API_URL = "https://script.google.com/macros/s/AKfycbxXpn0lB80LpLRaJHKBI5wgLjnyGLU-gXC3qTo-MxXBuJlHbTZ10ORuFdnDRl1LB2y5/exec";

  const makeSlug = (str) =>
    (str || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const res = await fetch(API_URL);
  const data = await res.json();

  const artikel = data.find(item => makeSlug(item.slug || item.id) === slug);

  if (!artikel) {
    return new Response("Not found", { status: 404 });
  }

  const title = artikel.title || "Artikel";
  const content = artikel.content || "";

  return new Response(`
  <html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <h1>${title}</h1>
    ${content}
    <br><a href="/">Kembali</a>
  </body>
  </html>
  `, {
    headers: { "content-type": "text/html" },
  });
}
