export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    const DOMAIN = url.origin;

    const API_URL = "https://script.google.com/macros/s/AKfycbxXpn0lB80LpLRaJHKBI5wgLjnyGLU-gXC3qTo-MxXBuJlHbTZ10ORuFdnDRl1LB2y5/exec";

    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = 12;

    // 🔥 HARUS SAMA dengan file artikel
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

    let pagination = `<div class="pagination">`;

    if (page > 1) {
      pagination += `<a href="/?page=${page - 1}">Prev</a>`;
    }

    for (let i = 1; i <= totalPages; i++) {
      pagination += `<a href="/?page=${i}" class="${i === page ? 'active' : ''}">${i}</a>`;
    }

    if (page < totalPages) {
      pagination += `<a href="/?page=${page + 1}">Next</a>`;
    }

    pagination += `</div>`;

    return new Response(`
    <html>
    <head>
      <title>Blog Artikel - Page ${page}</title>
      <meta name="description" content="Kumpulan artikel halaman ${page}">
      <link rel="canonical" href="${DOMAIN}/?page=${page}">
    </head>

    <body>
      <h1>Blog Artikel</h1>
      <div class="grid">${cards}</div>
      ${pagination}
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
