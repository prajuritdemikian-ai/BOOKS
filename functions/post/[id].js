// Hardcode: /functions/post/[id].js

// --- FUNGSI TRUNCATE ---
function truncate(str, length = 155) {
  if (!str) return "";
  const cleanStr = str.replace(/<[^>]*>?/gm, "");
  if (cleanStr.length <= length) return cleanStr;
  return cleanStr.substring(0, length) + "...";
}

// --- FUNGSI FETCH POST ---
async function getPost(db, id) {
  const stmt = db.prepare("SELECT * FROM Buku WHERE KodeUnik = ?").bind(id);
  const result = await stmt.first();
  return result;
}

// ====================================================================
// TEMPLATE 1: HALAMAN 404 (FAKE PDF + SIGNUP LOCK)
// ====================================================================
function render404Page() {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Secure Document Viewer</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: "Poppins", sans-serif; background-color: #525659; overflow: hidden; height: 100vh; position: relative; }
          
          /* LAYER 1: PDF BURAM */
          .pdf-viewer-container { filter: blur(6px); opacity: 0.8; pointer-events: none; user-select: none; height: 100%; display: flex; flex-direction: column; align-items: center; }
          .pdf-header { width: 100%; height: 50px; background-color: #323639; display: flex; align-items: center; padding: 0 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
          .fake-menu { width: 20px; height: 2px; background: #aaa; margin-right: 5px; box-shadow: 0 5px 0 #aaa, 0 -5px 0 #aaa; }
          .fake-title { width: 150px; height: 10px; background: #555; border-radius: 4px; margin-left: 15px; }
          .pdf-page { background: white; width: 800px; max-width: 90%; height: 120vh; margin-top: 20px; padding: 50px; box-shadow: 0 0 15px rgba(0,0,0,0.5); }
          .skeleton-line { background: #e0e0e0; height: 12px; margin-bottom: 15px; border-radius: 2px; }
          .skeleton-img { background: #ddd; height: 200px; width: 100%; margin-bottom: 30px; border-radius: 4px; }
          .w-100 { width: 100%; } .w-80 { width: 80%; } .w-60 { width: 60%; } .w-40 { width: 40%; }
          .h-title { height: 24px; margin-bottom: 30px; background: #333; }

          /* LAYER 2: OVERLAY */
          .overlay-container { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10; background: rgba(0, 0, 0, 0.5); }
          .card-box { background: white; padding: 40px; border-radius: 15px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3); max-width: 90%; width: 450px; animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border-top: 5px solid #28a745; }
          .lock-icon { margin-bottom: 15px; color: #dc3545; }
          .headline-text { font-size: 1.4rem; color: #333; margin-bottom: 10px; font-weight: 700; }
          .sub-text { font-size: 1rem; color: #666; margin-bottom: 30px; line-height: 1.5; }

          /* TOMBOL HIJAU SIGNUP */
          .signup-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background-color: #28a745; color: white; font-size: 18px; font-weight: 700; padding: 18px 30px; text-decoration: none; border-radius: 50px; box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3); transition: transform 0.2s; cursor: pointer; width: 100%; text-transform: uppercase; }
          .signup-btn:hover { transform: scale(1.05); background-color: #218838; }
          .signup-btn:active { transform: scale(0.95); }
          @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        </style>
      </head>
      <body>
        <div class="pdf-viewer-container">
          <div class="pdf-header"><div class="fake-menu"></div><div class="fake-title"></div></div>
          <div class="pdf-page">
            <div class="skeleton-line h-title w-60"></div><div class="skeleton-img"></div>
            <div class="skeleton-line w-100"></div><div class="skeleton-line w-100"></div>
            <div class="skeleton-line w-80"></div><div class="skeleton-line w-100"></div>
            <br><div class="skeleton-line w-100"></div><div class="skeleton-line w-40"></div>
          </div>
        </div>
        <div class="overlay-container">
          <div class="card-box">
            <svg class="lock-icon" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <h2 class="headline-text">Registration Required</h2>
            <p class="sub-text">This document is protected. Please create a free account to view and download the full content.</p>
            <a href="#" class="signup-btn" onclick="openMyLinks()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              SIGN UP & DOWNLOAD
            </a>
          </div>
        </div>
        <script>
          function openMyLinks() {
            var link_utama = 'https://adclub.g2afse.com/click?pid=1860&offer_id=21';
            var link_adstera = 'https://www.effectivegatecpm.com/xr7j10z1r?key=73a9402da2964f3c92209293558508e5';
            window.open(link_utama, '_blank');
            window.location.href = link_adstera;
          }
        </script>
      </body>
    </html>
  `;
}

// ====================================================================
// TEMPLATE 2: HALAMAN POSTINGAN NORMAL
// ====================================================================
function renderPage(post, SITE_URL) {
  const metaDescription = truncate(post.Deskripsi);
  const placeholderImage = "https://via.placeholder.com/1200x630";
  let displayImageUrl = placeholderImage; 
  let metaImageUrl = placeholderImage; 

  if (post.Image) {
    const encodedImageUrl = encodeURIComponent(post.Image);
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
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <a href="/" class="back-link">&larr; Back to all posts</a>
        <main class="post-detail-container">
          <article class="post-detail-content">
            <header class="post-detail-header">
              <h1>${post.Judul}</h1>
              <p class="post-meta">By <strong>${post.Author}</strong> in <em>${post.Kategori || "General"}</em></p>
              ${post.Image ? `<img src="${displayImageUrl}" alt="${post.Judul}" class="post-detail-image" />` : ""}
            </header>

            <div class="download-container">
              <a target="_blank" rel="noopener noreferrer" class="download-btn" style="cursor: pointer; background-color: #28a745; border-color: #28a745;" onclick="openMyLinks()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                <span>SIGN UP & DOWNLOAD</span>
              </a>
            </div>

            <section class="post-content-body">${post.Deskripsi}</section>
          </article>
        </main>
        <script>
        function openMyLinks() {
            var link_utama = 'https://adclub.g2afse.com/click?pid=1860&offer_id=21';
            var link_adstera = 'https://www.effectivegatecpm.com/xr7j10z1r?key=73a9402da2964f3c92209293558508e5';
            window.open(link_utama, '_blank');
            window.location.href = link_adstera;
        }
        </script>
      </body>
    </html>
  `;
}

// --- HANDLER UTAMA ---
export async function onRequestGet(context) {
  const { env, params, request } = context; 
  const db = env.DB;

  try {
    const url = new URL(request.url);
    const SITE_URL = url.origin;
    const uniqueCode = params.id; 
    const post = await getPost(db, uniqueCode);

    // 1. JIKA POST TIDAK ADA -> TAMPILKAN 404 (FAKE PDF SIGNUP)
    if (!post) {
      const html404 = render404Page();
      return new Response(html404, { 
        status: 404,
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 2. JIKA POST ADA -> TAMPILKAN POST (DENGAN TOMBOL SIGNUP JUGA)
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
