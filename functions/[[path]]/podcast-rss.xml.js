// Hardcode: /functions/[[path]]/podcast-rss.xml.js
// [MODIFIED] Full upgrade to professional Podcast RSS format (like Buzzsprout)
// [FIXED] Added missing PODCAST_LOCKED variable
// [FIXED 2] Fixed syntax error 'headers {' to 'headers: {'
// [FIXED 3] Fixed typo 'akhirAkhir' to 'judulAkhir'

const BLOG_TITLE = "PODCAST";
const BLOG_DESCRIPTION = "THE BEST PODCAST";

// [NEW] Helper function to clean and truncate text for summaries
function truncateAndClean(str, length = 250) {
  if (!str) return "";
  // Strip HTML tags (simple version)
  const cleanStr = str.replace(/<[^>]*>?/gm, '');
  // Truncate and add ellipsis
  const truncated = cleanStr.substring(0, length);
  return cleanStr.length > length ? truncated + "..." : truncated;
}

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
  const { env, request, params } = context;
  const db = env.DB;

  // --- [SETTINGS PODCAST BARU] ---
  // Ganti ini sesuai kebutuhan lu
  const PODCAST_AUTHOR = "Flowork Podcast";
  const PODCAST_OWNER_NAME = "Flowork";
  const PODCAST_CHANNEL_IMAGE_URL = "https://via.placeholder.com/1400x1400.png?text=Podcast+Cover"; // Ganti!
  const PODCAST_CHANNEL_GUID = "c2b6a411-57d1-e910-b31f-1c111db475c5"; // GUID Unik buat channel lu
  const DEFAULT_DURATION_SECONDS = 600; // 10 menit (karena audio palsu)
  const DEFAULT_SEASON = 1;
  const PODCAST_LOCKED = "no"; // [FIX 1]
  // --- [AKHIR SETTINGS] ---

  try {
    const url = new URL(request.url);
    const SITE_URL = url.origin;

    // [MODIFIED] Get parameters from dynamic path
    const pathSegments = params.path || [];
    const kategori = pathSegments[0] || "Podcast"; // Ambil segmen pertama, default ke "Podcast"
    const judulAwal = pathSegments[1] || ""; // Ambil segmen kedua
    const judulAkhir = pathSegments[2] || ""; // Ambil segmen ketiga

    // 3. Siapin query SQL
    const queryParams = [];
    let query =
      "SELECT ID, Judul, Deskripsi, Image, KodeUnik, tangal FROM Buku WHERE tangal IS NOT NULL AND tangal <= DATE('now')";

    if (kategori) {
      query += " AND UPPER(Kategori) = UPPER(?)";
      queryParams.push(kategori);
    }
    query += " ORDER BY tangal DESC LIMIT 500";

    const stmt = db.prepare(query).bind(...queryParams);
    const { results } = await stmt.all();

    // 4. Bikin judul & link dinamis
    const feedTitle = kategori
      ? `${escapeXML(BLOG_TITLE)} - ${escapeXML(kategori)}`
      : escapeXML(BLOG_TITLE);
    const selfLink = url.href;
    const channelTitle = `${judulAwal} ${feedTitle} ${judulAkhir}`;


    // 5. Mulai bikin string XML
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet href="https://flowork.cloud/podcast-style.xsl" type="text/xsl"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:podcast="https://podcastindex.org/namespace/1.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${channelTitle}</title>
  <link>${SITE_URL}</link>
  <description><![CDATA[${BLOG_DESCRIPTION} Artikel tentang ${feedTitle} ditulis OLEH <a href="https://flowork.cloud">Flowork</a>]]></description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <generator>Flowork (Cloudflare)</generator>
  <copyright>© ${new Date().getFullYear()} ${PODCAST_OWNER_NAME}</copyright>

  <atom:link href="${selfLink}" rel="self" type="application/rss+xml" />
  <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" xmlns="http://www.w3.org/2005/Atom" />

  <podcast:locked>${PODCAST_LOCKED}</podcast:locked>
  <podcast:guid>${PODCAST_CHANNEL_GUID}</podcast:guid>

  <itunes:author>${PODCAST_AUTHOR}</itunes:author>
  <itunes:type>episodic</itunes:type>
  <itunes:explicit>false</itunes:explicit>
  <itunes:owner>
    <itunes:name>${PODCAST_OWNER_NAME}</itunes:name>
  </itunes:owner>
  <image>
     <url>${PODCAST_CHANNEL_IMAGE_URL}</url>
     <title>${channelTitle}</title>
     <link>${SITE_URL}</link>
  </image>
  <itunes:image href="${PODCAST_CHANNEL_IMAGE_URL}" />
  <itunes:category text="Education" />
`;

    // 6. Looping setiap postingan
    const totalResults = results.length;
    results.forEach((post, i) => {
      const episodeNumber = totalResults - i; // Episode terbaru = nomor tertinggi
      const postUrl = `${SITE_URL}/post/${post.KodeUnik}`;
      const audioUrl = `${SITE_URL}/podcast-audio/${post.KodeUnik}.mp3`;

      // Gabungin judul
      const judulAsli = escapeXML(post.Judul);
      // [FIX 3] Ini dia yang bener
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
    <itunes:title>${judulBaru}</itunes:title>
    <link>${postUrl}</link>
    <guid isPermaLink="false">${escapeXML(post.KodeUnik)}</guid>

    <description><![CDATA[
      ${post.Deskripsi || "No description."}
      <br/><br/>
      ${BLOG_DESCRIPTION} Artikel tentang ${feedTitle} ditulis OLEH <a href="https://flowork.cloud">Flowork</a>
    ]]></description>
    <content:encoded><![CDATA[${post.Deskripsi || "No description."}]]></content:encoded>
    <itunes:summary>${truncateAndClean(post.Deskripsi)}</itunes:summary>

    ${
      post.tangal
        ? `<pubDate>${new Date(post.tangal).toUTCString()}</pubDate>`
        : ""
    }

    <enclosure url="${audioUrl}" type="audio/mpeg" length="1000000" />
    <itunes:author>${PODCAST_AUTHOR}</itunes:author>
    <itunes:duration>${DEFAULT_DURATION_SECONDS}</itunes:duration>
    <itunes:keywords></itunes:keywords>
    <itunes:season>${DEFAULT_SEASON}</itunes:season>
    <itunes:episode>${episodeNumber}</itunes:episode>
    <itunes:episodeType>full</itunes:episodeType>
    <itunes:explicit>false</itunes:explicit>
    ${
      proxiedImageUrl
        ? `<itunes:image href="${escapeXML(proxiedImageUrl)}" />`
        : ""
    }
  </item>
`;
    }); // Akhir loop forEach

    // 7. Tutup tag channel dan rss
    xml += `
</channel>
</rss>`;

    // 8. Kirim hasilnya
    return new Response(xml, {
      headers: { // [FIX 2]
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600",
      },
    });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, {
      status: 500,
      headers: { "Content-Type": "text-plain" },
    });
  }
}