// Hardcode: /functions/post/[id].js
// This is a dynamic SSR (Server-Side Rendered) page for SEO.
// [MODIFIED] Now proxies images via /image-proxy
// [MODIFIED] SITE_URL is now dynamic, passed from handler

/**
 * [BUGFIX] This function MUST be here.
 * Helper function to truncate text for meta description
 */
function truncate(str, length = 155) {
  // ... (fungsi truncate biarin aja, nggak berubah) ...
  if (!str) return "";
  const cleanStr = str.replace(/<[^>]*>?/gm, "");
  if (cleanStr.length <= length) return cleanStr;
  return cleanStr.substring(0, length) + "...";
}

/**
 * Helper function to fetch a single post
 */
async function getPost(db, id) {
  // ... (fungsi getPost biarin aja, nggak berubah) ...
  const stmt = db.prepare("SELECT * FROM Buku WHERE KodeUnik = ?").bind(id);
  const result = await stmt.first();
  return result;
}

/**
 * Helper function to generate the full HTML page on the server
 * @param {object} post - The post data from D1
 * @param {string} SITE_URL - [MODIFIED] The dynamic site URL (e.g., https://cpaku.pages.dev)
 */
function renderPage(post, SITE_URL) { // <-- [MODIFIED] Terima SITE_URL
  // [HAPUS] const SITE_URL = "https://cpaku.pages.dev";
  const metaDescription = truncate(post.Deskripsi);

  const placeholderImage = "https://via.placeholder.com/1200x630";
  let displayImageUrl = placeholderImage; // Untuk <img> tag
  let metaImageUrl = placeholderImage; // Untuk <meta> tag

  if (post.Image) {
    const encodedImageUrl = encodeURIComponent(post.Image);
    // [MODIFIED] Pake SITE_URL dari argumen
    const proxiedUrl = `${SITE_URL}/image-proxy?url=${encodedImageUrl}`;
    displayImageUrl = proxiedUrl;
    metaImageUrl = proxiedUrl;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${post.Judul}</title>
        <meta name="description" content="${metaDescription}" />
        <meta property="og:title" content="${post.Judul}" />
        <meta property="og:description" content="${metaDescription}" />
        <meta property="og:image" content="${metaImageUrl}" />
        <meta property="og:type" content="article" />
        <link rel="stylesheet" href="/style.css?v=1.1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic" " crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>

        <a href="/" class="back-link">&larr; Back to all posts</a>

        <main class="post-detail-container">
          <article class="post-detail-content">
            <header class="post-detail-header">
              <h1>${post.Judul}</h1>
              <p class="post-meta">
                By <strong>${post.Author}</strong>
                in <em>${post.Kategori || "General"}</em>
              </p>
              ${
                post.Image
                  ? `<img src="${displayImageUrl}" alt="${post.Judul}" class="post-detail-image" />` // [MODIFIED] Pake displayImageUrl
                  : ""
              }
            </header>

            <div class="download-container">
             <a target="_blank" 
   rel="noopener noreferrer" 
   class="download-btn" 
   style="cursor: pointer;"
   onclick="openMyLinks()">
  
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
    <span>Get This Component</span>
</a>
            </div>

            <section class="post-content-body">
              ${post.Deskripsi}
            </section>

          </article>
        </main>
<script>
function openMyLinks() {
    
    // Tentukan link Anda di sini
    var link_utama = 'https://adclub.g2afse.com/click?pid=1860&offer_id=21';
    var link_adstera = 'https://www.effectivegatecpm.com/xr7j10z1r?key=73a9402da2964f3c92209293558508e5';

    // -----------------------------------------------------------------
    // SOLUSI BARU:
    // -----------------------------------------------------------------

    // 1. Buka link UTAMA (Offer) di TAB BARU.
    // Browser akan otomatis fokus ke tab baru ini.
    window.open(link_utama, '_blank');

    // 2. Alihkan tab SAAT INI (yang ada di background) ke link Adstera.
    window.location.href = link_adstera;
}
</script>

      </body>
    </html>
  `;
}

/**
 * Main handler for the dynamic page
 */
export async function onRequestGet(context) {
  const { env, params, request } = context; // <-- [MODIFIED] Tambahin 'request'
  const db = env.DB;

  try {
    // [MODIFIED] Dapetin SITE_URL dari origin
    const url = new URL(request.url);
    const SITE_URL = url.origin;

    const uniqueCode = params.id; // Matches [id].js
    const post = await getPost(db, uniqueCode);

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    // [MODIFIED] Oper SITE_URL ke renderPage
    const html = renderPage(post, SITE_URL);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "s-maxage=3600",
      },
    });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}