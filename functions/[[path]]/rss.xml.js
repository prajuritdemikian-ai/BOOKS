// Hardcode: /functions/[[path]]/rss.xml.js
// [NEW] This is a "catch-all" route for flexible RSS URLs.
// It will catch /a/b/c/rss.xml, /a/rss.xml, etc.
// NOTE: It will NOT catch /rss.xml (that's handled by the original file)

const BLOG_TITLE = "RSS FEEDS";
const BLOG_DESCRIPTION = "ALL RSSS FEEDS";

function escapeXML(str) {
  if (!str) return "";
  return str.replace(/[<>&"']/g, function (match) {
    switch (match) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return match;
    }
  });
}

export async function onRequestGet(context) {
  const { env, request, params } = context;
  const db = env.DB;

  try {
    const url = new URL(request.url);
    const SITE_URL = url.origin;

    // [MODIFIED] This is the flexible part!
    // params.path is an ARRAY of path segments
    // e.g., /book/DOWNLOAD/FORFREE/rss.xml -> params.path = ["book", "DOWNLOAD", "FORFREE"]
    // e.g., /book/rss.xml -> params.path = ["book"]
    const pathSegments = params.path || [];

    // Assign segments flexibly:
    const kategori = pathSegments[0] || null; // Ambil segmen pertama sbg kategori
    const judulAwal = pathSegments[1] || ""; // Ambil segmen kedua sbg judulawal
    const judulAkhir = pathSegments[2] || ""; // Ambil segmen ketiga sbg judulakhir
    // Lu bisa tambahin pathSegments[3], [4], dst. kalo mau, tapi 3 ini sesuai request lu

    // 2. Siapin query SQL
    const queryParams = [];
    let query =
      "SELECT Judul, Deskripsi, Image, KodeUnik, tangal FROM Buku WHERE tangal IS NOT NULL AND tangal <= DATE('now')";

    if (kategori) {
      query += " AND UPPER(Kategori) = UPPER(?)";
      queryParams.push(kategori);
    }
    query += " ORDER BY tangal DESC LIMIT 500";
    const stmt = db.prepare(query).bind(...queryParams);
    const { results } = await stmt.all();

    // 3. Bikin judul & link dinamis
    const feedTitle = kategori
      ? `${escapeXML(BLOG_TITLE)} - Kategori: ${escapeXML(kategori)}`
      : escapeXML(BLOG_TITLE);
    const selfLink = url.href;

    // 4. Mulai bikin string XML
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${judulAwal} ${feedTitle} ${judulAkhir}</title>
  <link>${SITE_URL}</link>
  <description>${escapeXML(BLOG_DESCRIPTION)}</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${selfLink}" rel="self" type="application/rss+xml" />
`;

    // 5. Looping setiap postingan
    for (const post of results) {
      const postUrl = `${SITE_URL}/post/${post.KodeUnik}`;

      const judulAsli = escapeXML(post.Judul);
      const judulBaru = `${judulAwal ? escapeXML(judulAwal) + ' ' : ''}${judulAsli}${judulAkhir ? ' ' + escapeXML(judulAkhir) : ''}`;

      let proxiedImageUrl = "";
      if (post.Image) {
        const encodedImageUrl = encodeURIComponent(post.Image);
        proxiedImageUrl = `${SITE_URL}/image-proxy?url=${encodedImageUrl}`;
      }

      xml += `
  <item>
    <title>${judulBaru}</title> <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>
    <g:id>${escapeXML(post.KodeUnik)}</g:id>
    <description><![CDATA[${post.Deskripsi || "No description."}<br/><br/> Artikel tentang ${feedTitle} ditulis OLEH <a href="https://flowork.cloud">Flowork</a>]]></description>
    ${
      proxiedImageUrl
        ? `<g:image_link>${escapeXML(proxiedImageUrl)}</g:image_link>`
        : ""
    }
    <g:availability>in stock</g:availability>
    ${
      post.tangal
        ? `<pubDate>${new Date(post.tangal).toUTCString()}</pubDate>`
        : ""
    }
    </item>
`;
    }
    xml += `
</channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600",
      },
    });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}