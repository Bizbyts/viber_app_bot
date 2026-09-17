// Netlify Serverless Function for App Lookup
// Queries the public iTunes Search API and normalizes responses into our common schema.

const https = require("https");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "AppInfoBot/1.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

function normalizeItunes(raw) {
  const price =
    raw.formattedPrice ||
    (raw.price === 0 ? "Free" : `$${raw.price ?? "?"}`);

  return {
    store: "App Store",
    track_id: raw.trackId ? String(raw.trackId) : null,
    name: raw.trackName,
    developer: raw.artistName,
    category: raw.primaryGenreName,
    rating: raw.averageUserRating ? Number(raw.averageUserRating.toFixed(1)) : null,
    rating_count: raw.userRatingCount,
    price: price,
    version: raw.version,
    size_bytes: raw.fileSizeBytes ? Number(raw.fileSizeBytes) : null,
    min_os: raw.minimumOsVersion,
    released: (raw.releaseDate || "").slice(0, 10),
    updated: (raw.currentVersionReleaseDate || "").slice(0, 10),
    description: raw.description,
    icon_url: raw.artworkUrl512 || raw.artworkUrl100,
    store_url: raw.trackViewUrl,
    screenshots: raw.screenshotUrls || [],
    content_rating: raw.contentAdvisoryRating,
  };
}

exports.handler = async (event) => {
  const query = (event.queryStringParameters && event.queryStringParameters.q) || "";
  const id = (event.queryStringParameters && event.queryStringParameters.id) || "";

  if (!query && !id) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Missing 'q' or 'id' query parameter" }),
    };
  }

  try {
    let url = "";
    if (id) {
      url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}`;
    } else {
      url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        query
      )}&entity=software&limit=8`;
    }

    const data = await fetchJson(url);
    const results = (data.results || []).map(normalizeItunes);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        query: query || id,
        count: results.length,
        results: results,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
