export async function onRequest(context) {
  try {
    const { params, request } = context;

    const slug = params.slug;

    const url = new URL(request.url);
    const DOMAIN = url.origin;

    const API_URL = "https://script.google.com/macros/s/AKfycbxXpn0lB80LpLRaJHKBI5wgLjnyGLU-gXC3qTo-MxXBuJlHbTZ10ORuFdnDRl1LB2y5/exec";

    // 🔥 HARUS SAMA dengan index.js
    const makeSlug = (str) =>
      (str || "")
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const escapeHtml = (str) =>
      (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    // FETCH
    const res = await fetch(API_URL);
    const data = await res.json();

    const artikel = data.find(item =>
      makeSlug(item.slug || item.id) === slug
    );

    if (!artikel) {
      return new Response("Not found", { status: 404 });
    }

    const title = escapeHtml(artikel.title || "Artikel");
    const desc = escapeHtml(
      artikel.meta_description || (artikel.content || "").substring(0, 140)
    );

    const content = artikel.content || "";
    const image = artikel.image || "/default.png";

    const fullUrl = `${DOMAIN}/artikel/${slug}`;

    return new Response(`
    <html>
    <head>
      <title>${title}</title>
      <meta name="description" content="${desc}">
      <link rel="canonical" href="${fullUrl}">
    </head>

    <body>
      <img src="${image}" alt="${title}">
      <h1>${title}</h1>
      <p>${desc}</p>

      ${content}

      <br><a href="/">← Kembali</a>
    </body>
    </html>
    `, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "public, max-age=300"
      },
    });

  } catch (err) {
    return new Response("ERROR:\n" + err.toString(), { status: 500 });
  }
}
