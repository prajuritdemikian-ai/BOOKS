// Hardcode: /functions/podcast-audio/[id].mp3.js
// [MODIFIED] TOTAL_TRACKS diubah jadi 1

// --- [SETTING PENTING] ---
// [MODIFIED] Di-set jadi 1 karena lu cuma punya 1 file contoh
const TOTAL_TRACKS = 1;
// [MODIFIED] Pastiin nama file lu ini:
const AUDIO_PATH_PREFIX = "/audio/track_";
const AUDIO_PATH_SUFFIX = ".mp3";
// -------------------------

/**
 * Simple hash function to convert a string (KodeUnik)
 * into a consistent number.
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash); // Ensure positive number
}

/**
 * Main handler for the audio request
 */
export async function onRequestGet(context) {
  const { params, request } = context;
  const id = params.id;

  if (!id) {
    return new Response("Not found", { status: 404 });
  }

  // 1. Ubah KodeUnik (string) jadi angka yang konsisten
  const hash = simpleHash(id);

  // 2. Tentukan file mana yang mau diambil
  // [MODIFIED] Karena TOTAL_TRACKS = 1, (hash % 1) selalu 0.
  // Hasilnya (0 + 1) akan SELALU 1.
  const trackNumber = (hash % TOTAL_TRACKS) + 1; // Akan selalu 1

  // 3. Format angka jadi 3 digit (001)
  const trackId = trackNumber.toString().padStart(3, "0"); // Akan selalu "001"

  // 4. Bikin URL file MP3 aslinya
  // Ini bakal SELALU jadi /audio/track_001.mp3
  const targetAudioUrl = `${AUDIO_PATH_PREFIX}${trackId}${AUDIO_PATH_SUFFIX}`;

  // 5. Ambil URL domain saat ini
  const url = new URL(request.url);
  const fullAudioUrl = new URL(targetAudioUrl, url.origin);

  // 6. Ambil file statisnya dari /public/audio/
  try {
    const response = await fetch(fullAudioUrl.href);

    if (!response.ok) {
      // KALO INI MASIH 404, ARTINYA:
      // File lu BUKAN 'track_001.mp3'
      // ATAU file lu nggak ada di folder 'public/audio/'
      return new Response(
        `File not found: ${targetAudioUrl}. Pastiin file lu namanya 'track_001.mp3' dan ada di 'public/audio/'`,
        { status: 404 }
      );
    }

    // 7. Sajikan file MP3 ke user
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Cache-Control", "public, s-maxage=86400, max-age=86400");

    return new Response(response.body, {
      status: 200,
      headers: newHeaders,
    });
  } catch (e) {
    return new Response(`Error fetching audio: ${e.message}`, { status: 500 });
  }
}