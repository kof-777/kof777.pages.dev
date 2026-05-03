export async function onRequest(context) {
  const url = new URL(context.request.url);
  const DOMAIN = url.origin;

  const API_URL = "https://script.google.com/macros/s/AKfycbxXpn0lB80LpLRaJHKBI5wgLjnyGLU-gXC3qTo-MxXBuJlHbTZ10ORuFdnDRl1LB2y5/exec";

  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = 12;

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

  // fetch
  const res = await fetch(API_URL);
  const data = await res.json();

  const start = (page - 1) * perPage;
  const paginated = data.slice(start, start + perPage);

  let cards = "";

  paginated.forEach(item => {
    const s = makeSlug(item.slug || item.id);
    const title = escapeHtml(item.title || "Artikel");
    const desc = escapeHtml((item.meta_description || "").substring(0, 120));

    const image = item.image || "/default.png";

    cards += `
      <a href="/artikel/${s}" class="card">
        <img src="${image}" alt="${title}">
        <h2>${title}</h2>
        <p>${desc}</p>
      </a>
    `;
  });

  const totalPages = Math.ceil(data.length / perPage);

  let pagination = "";
  for (let i = 1; i <= totalPages; i++) {
    pagination += `<a href="/?page=${i}">${i}</a>`;
  }

  return new Response(`
  <html>
  <head>
    <title>Blog</title>
  </head>
  <body>
    <div class="grid">${cards}</div>
    ${pagination}
  </body>
  </html>
  `, {
    headers: { "content-type": "text/html" },
  });
}
