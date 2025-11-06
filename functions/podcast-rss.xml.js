// Hardcode: /functions/podcast-rss.xml.js
// [MODIFIED] BLOG_TITLE dan BLOG_DESCRIPTION diubah sesuai request
// [MODIFIED] <description> di <item> sekarang gabungin deskripsi asli + deskripsi channel

const BLOG_TITLE = "PODCAST";
const BLOG_DESCRIPTION = "THE BEST PODCAST";

function escapeXML(str) {
  if (!str) return "";
  return str.replace(/[<>&"']/g, function (match) {
    switch (match) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return match;
    }
  });
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const db = env.DB;

  try {
    // 1. Ambil SEMUA parameter
    const url = new URL(request.url);
    const SITE_URL = url.origin;
    const kategori = url.searchParams.get("kategori") || "Podcast";
    const judulAwal = url.searchParams.get("judulawal") || "";
    const judulAkhir = url.searchParams.get("judulakhir") || "";

    // 3. Siapin query SQL
    const params = [];
    let query =
      "SELECT Judul, Deskripsi, Image, KodeUnik, tangal FROM Buku WHERE tangal IS NOT NULL AND tangal <= DATE('now')";

    if (kategori) {
      query += " AND UPPER(Kategori) = UPPER(?)";
      params.push(kategori);
    }
    query += " ORDER BY tangal DESC LIMIT 500";

    const stmt = db.prepare(query).bind(...params);
    const { results } = await stmt.all();

    // 4. Bikin judul & link dinamis
    const feedTitle = kategori
      ? `${escapeXML(BLOG_TITLE)} - ${escapeXML(kategori)}`
      : escapeXML(BLOG_TITLE);
    const selfLink = url.href;

    // 5. Mulai bikin string XML
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${judulAwal} ${feedTitle} ${judulAkhir}</title>
  <link>${SITE_URL}</link>
  <description><![CDATA[${BLOG_DESCRIPTION} Artikel tentang ${feedTitle} ditulis OLEH <a href="https://flowork.cloud">Flowork</a>]]></description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${selfLink}" rel="self" type="application/rss+xml" />
`;

    // 6. Looping setiap postingan
    for (const post of results) {
      const postUrl = `${SITE_URL}/post/${post.KodeUnik}`;
      const audioUrl = `${SITE_URL}/podcast-audio/${post.KodeUnik}.mp3`; // Pake .mp3

      // Gabungin judul
      const judulAsli = escapeXML(post.Judul);
      const judulBaru = `${
        judulAwal ? escapeXML(judulAwal) + " " : ""
      }${judulAsli}${judulAkhir ? " " + escapeXML(judulAkhir) : ""}`;

      // Bikin URL gambar proxy
      let proxiedImageUrl = "";
      if (post.Image) {
        const encodedImageUrl = encodeURIComponent(post.Image);
        proxiedImageUrl = `${SITE_URL}/image-proxy?url=${encodedImageUrl}`;
      }

      xml += `
  <item>
    <title>${judulBaru}</title>
    <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>

    <description><![CDATA[
      ${post.Deskripsi || "No description."}
      <br/><br/>
      ${BLOG_DESCRIPTION} Artikel tentang ${feedTitle} ditulis OLEH <a href="https://flowork.cloud">Flowork</a>
    ]]></description>

    ${
      post.tangal
        ? `<pubDate>${new Date(post.tangal).toUTCString()}</pubDate>`
        : ""
    }

    <enclosure url="${audioUrl}" type="audio/mpeg" length="1000000" />

    ${
      proxiedImageUrl
        ? `<itunes:image href="${escapeXML(proxiedImageUrl)}" />`
        : ""
    }
  </item>
`;
    }

    // 7. Tutup tag channel dan rss
    xml += `
</channel>
</rss>`;

    // 8. Kirim hasilnya
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