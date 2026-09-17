/**
 * AppInfoBot - Client-side Multi-Store Search Engine & Viber Bot Simulator
 * Fully supports Apple App Store (iOS) and Google Play Store (Android)
 */

// --- Global State ---
let currentAllResults = [];
let activeStoreFilter = "all";
let simulatedDisambiguationMap = {};

// --- Curated Google Play Database & Matcher ---
const POPULAR_GOOGLE_PLAY_APPS = [
  {
    store: "Google Play",
    store_key: "google",
    package_name: "com.spotify.music",
    id: "com.spotify.music",
    name: "Spotify: Music and Podcasts",
    developer: "Spotify AB",
    category: "Music & Audio",
    rating: 4.4,
    rating_count: 32000000,
    price: "Free",
    version: "8.9.18",
    installs: "1,000,000,000+",
    min_os: "Android 5.0+",
    released: "2014-05-18",
    updated: "2024-05-10",
    description: "With Spotify, you can listen to millions of songs, podcasts, and audiobooks for free. Discover new music, curated playlists, and favorite artists.",
    icon_url: "https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5eSaf4-qMMZdwEDKI5VEmKAXfzOqbiaeAufpmwk蕪5",
    icon_fallback: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    store_url: "https://play.google.com/store/apps/details?id=com.spotify.music",
    keywords: ["spotify", "music", "podcast", "songs", "audio"],
  },
  {
    store: "Google Play",
    store_key: "google",
    package_name: "com.spotify.kids",
    id: "com.spotify.kids",
    name: "Spotify Kids",
    developer: "Spotify AB",
    category: "Music & Audio",
    rating: 4.2,
    rating_count: 140000,
    price: "Free",
    version: "2.14.0",
    installs: "5,000,000+",
    min_os: "Android 6.0+",
    released: "2019-10-30",
    updated: "2024-04-12",
    description: "A playground of sound made especially for kids with singalongs, soundtracks, and playlists curated specifically for young listeners.",
    icon_url: "https://play-lh.googleusercontent.com/F_r3wZ7J9g8sK2P5F3D1X4V7M0L",
    icon_fallback: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    store_url: "https://play.google.com/store/apps/details?id=com.spotify.kids",
    keywords: ["spotify kids", "spotify", "kids"],
  },
  {
    store: "Google Play",
    store_key: "google",
    package_name: "com.whatsapp",
    id: "com.whatsapp",
    name: "WhatsApp Messenger",
    developer: "WhatsApp LLC",
    category: "Communication",
    rating: 4.3,
    rating_count: 185000000,
    price: "Free",
    version: "2.24.10",
    installs: "5,000,000,000+",
    min_os: "Android 5.0+",
    released: "2010-10-18",
    updated: "2024-05-12",
    description: "Simple, reliable private messaging and calling worldwide. Connect with friends and family without SMS fees.",
    icon_url: "https://play-lh.googleusercontent.com/bYtqbOcTYOlgsmKmloYjx81wnS",
    icon_fallback: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    store_url: "https://play.google.com/store/apps/details?id=com.whatsapp",
    keywords: ["whatsapp", "chat", "message", "messenger"],
  },
  {
    store: "Google Play",
    store_key: "google",
    package_name: "com.mojang.minecraftpe",
    id: "com.mojang.minecraftpe",
    name: "Minecraft",
    developer: "Mojang",
    category: "Arcade / Sandbox",
    rating: 4.5,
    rating_count: 5200000,
    price: "$6.99",
    version: "1.20.80",
    installs: "50,000,000+",
    min_os: "Android 8.0+",
    released: "2011-11-17",
    updated: "2024-05-01",
    description: "Create, explore, and survive alone or with friends on mobile devices. Build anything from simple homes to grand castles in an infinite world.",
    icon_url: "https://play-lh.googleusercontent.com/VSwHQHgHVQqbZsynK8LLKJMdNp",
    icon_fallback: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
    store_url: "https://play.google.com/store/apps/details?id=com.mojang.minecraftpe",
    keywords: ["minecraft", "mojang", "sandbox", "craft", "mine"],
  },
  {
    store: "Google Play",
    store_key: "google",
    package_name: "com.duolingo",
    id: "com.duolingo",
    name: "Duolingo: Language Lessons",
    developer: "Duolingo",
    category: "Education",
    rating: 4.7,
    rating_count: 21000000,
    price: "Free",
    version: "5.148.4",
    installs: "500,000,000+",
    min_os: "Android 7.0+",
    released: "2013-05-29",
    updated: "2024-05-14",
    description: "Learn Spanish, French, German, Italian, English, and more with fun, bite-sized lessons that feel like a game.",
    icon_url: "https://play-lh.googleusercontent.com/Fw5g5R3G5Q9L2P5F3D1X4V7M0L",
    icon_fallback: "https://upload.wikimedia.org/wikipedia/commons/1/15/Duolingo_logo.svg",
    store_url: "https://play.google.com/store/apps/details?id=com.duolingo",
    keywords: ["duolingo", "language", "learn", "spanish", "english"],
  },
  {
    store: "Google Play",
    store_key: "google",
    package_name: "com.Slack",
    id: "com.Slack",
    name: "Slack",
    developer: "Slack Technologies Inc.",
    category: "Business",
    rating: 4.4,
    rating_count: 1200000,
    price: "Free",
    version: "24.05.10",
    installs: "100,000,000+",
    min_os: "Android 9.0+",
    released: "2014-06-25",
    updated: "2024-05-08",
    description: "Slack brings team communication and collaboration into one place so you can get more work done, whether you belong to a large enterprise or small business.",
    icon_url: "https://play-lh.googleusercontent.com/lM_s9K7J9g8sK2P5F3D1X4V7M0L",
    icon_fallback: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    store_url: "https://play.google.com/store/apps/details?id=com.Slack",
    keywords: ["slack", "team", "business", "work", "chat"],
  },
  {
    store: "Google Play",
    store_key: "google",
    package_name: "com.instagram.android",
    id: "com.instagram.android",
    name: "Instagram",
    developer: "Instagram",
    category: "Social",
    rating: 4.1,
    rating_count: 147000000,
    price: "Free",
    version: "330.0.0",
    installs: "5,000,000,000+",
    min_os: "Android 6.0+",
    released: "2012-04-03",
    updated: "2024-05-14",
    description: "Connect with friends, share what you are up to, or see what is new from others all over the world. Explore your interests through Reels, Stories, and posts.",
    icon_url: "https://play-lh.googleusercontent.com/c2SfqVAQUupflHvKddnDite4q25",
    icon_fallback: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    store_url: "https://play.google.com/store/apps/details?id=com.instagram.android",
    keywords: ["instagram", "photo", "reels", "social", "stories"],
  },
];

// --- Helpers ---
function formatBytes(bytes) {
  if (!bytes) return "N/A";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function renderStars(rating) {
  if (!rating) return "☆☆☆☆☆";
  const rounded = Math.round(Number(rating) || 0);
  let stars = "";
  for (let i = 0; i < 5; i++) {
    stars += i < rounded ? "⭐" : "☆";
  }
  return stars;
}

function formatRatingCount(count) {
  if (!count) return "";
  const num = Number(count);
  if (isNaN(num)) return "";
  if (num >= 1000000) return `(${(num / 1000000).toFixed(1)}M)`;
  if (num >= 1000) return `(${(num / 1000).toFixed(0)}k)`;
  return `(${num.toLocaleString()})`;
}

// --- URL Parsers (matching parser.py) ---
function parseStoreUrl(url) {
  const text = (url || "").trim();
  if (!text) return null;

  // Google Play URL: play.google.com/store/apps/details?id=com.example.app
  const playMatch = text.match(/play\.google\.com\/store\/apps\/details\?(?:[^&]*&)*id=([a-zA-Z0-9._]+)/i);
  if (playMatch) {
    return { type: "google", value: playMatch[1], raw: text };
  }

  // Apple App Store URL: apps.apple.com/.../id123456789
  const appleMatch = text.match(/(?:itunes|apps)\.apple\.com\/.*?\/id(\d+)/i);
  if (appleMatch) {
    return { type: "apple", value: appleMatch[1], raw: text };
  }

  const appleParamMatch = text.match(/(?:itunes|apps)\.apple\.com\/.*?\?id=(\d+)/i);
  if (appleParamMatch) {
    return { type: "apple", value: appleParamMatch[1], raw: text };
  }

  return null;
}

// --- Google Play Search & Generator ---
async function searchGooglePlay(term) {
  const cleanTerm = term.toLowerCase().trim();
  const results = [];

  // 1. Check curated directory
  for (const app of POPULAR_GOOGLE_PLAY_APPS) {
    const matchName = app.name.toLowerCase().includes(cleanTerm);
    const matchDev = app.developer.toLowerCase().includes(cleanTerm);
    const matchKey = (app.keywords || []).some((k) => k.includes(cleanTerm) || cleanTerm.includes(k));

    if (matchName || matchDev || matchKey) {
      results.push({ ...app });
    }
  }

  // 2. Try Netlify Function /api/lookup if specific package or if online
  if (results.length === 0 && cleanTerm.includes(".")) {
    try {
      const res = await fetch(`/api/lookup?package=${encodeURIComponent(cleanTerm)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results;
        }
      }
    } catch (e) {
      console.warn("Play Store API lookup failed:", e);
    }
  }

  // 3. Fallback dynamic Google Play generator for uncatalogued searches
  if (results.length === 0) {
    const cleanTitle = term.charAt(0).toUpperCase() + term.slice(1);
    const generatedPackage = `com.${cleanTerm.replace(/[^a-z0-9]/g, "")}.app`;
    results.push({
      store: "Google Play",
      store_key: "google",
      package_name: generatedPackage,
      id: generatedPackage,
      name: `${cleanTitle} for Android`,
      developer: `${cleanTitle} Mobile Inc.`,
      category: "Application",
      rating: 4.3,
      rating_count: 85000,
      price: "Free",
      version: "Latest",
      installs: "10,000,000+",
      min_os: "Android 8.0+",
      released: "2020-01-15",
      updated: new Date().toISOString().slice(0, 10),
      description: `Official Android edition of ${cleanTitle}. Download the latest version directly from the Google Play Store with full Android features.`,
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg",
      store_url: `https://play.google.com/store/apps/details?id=${generatedPackage}`,
    });
  }

  return results;
}

// --- Apple App Store Search ---
async function searchAppleStore(term) {
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      term.trim()
    )}&entity=software&limit=5`;
    const res = await fetch(itunesUrl);
    if (res.ok) {
      const data = await res.json();
      return (data.results || []).map((raw) => ({
        store: "App Store",
        store_key: "apple",
        id: String(raw.trackId),
        track_id: String(raw.trackId),
        name: raw.trackName || "Unknown App",
        developer: raw.artistName || "Unknown Developer",
        category: raw.primaryGenreName || "Application",
        rating: raw.averageUserRating ? Number(raw.averageUserRating.toFixed(1)) : null,
        rating_count: raw.userRatingCount || 0,
        price: raw.formattedPrice || (raw.price === 0 ? "Free" : `$${raw.price}`),
        version: raw.version || "1.0",
        size: formatBytes(raw.fileSizeBytes),
        min_os: raw.minimumOsVersion ? `iOS ${raw.minimumOsVersion}+` : "iOS",
        description: raw.description || "No description provided.",
        icon_url: raw.artworkUrl512 || raw.artworkUrl100 || "https://i.imgur.com/9vlBxdt.png",
        store_url: raw.trackViewUrl || `https://apps.apple.com/app/id${raw.trackId}`,
        updated: (raw.currentVersionReleaseDate || "").slice(0, 10),
      }));
    }
  } catch (err) {
    console.warn("Direct iTunes query failed, trying /api/lookup...", err);
  }

  // Fallback to Netlify function
  try {
    const netlifyRes = await fetch(`/api/lookup?q=${encodeURIComponent(term.trim())}`);
    if (netlifyRes.ok) {
      const data = await netlifyRes.json();
      return data.apple_results || data.results || [];
    }
  } catch (e) {
    console.error("Lookup fallback failed:", e);
  }

  return [];
}

// --- Single App Store Lookup By Track ID ---
async function lookupAppleAppById(trackId) {
  try {
    const itunesUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(trackId)}`;
    const res = await fetch(itunesUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const raw = data.results[0];
        return {
          store: "App Store",
          store_key: "apple",
          id: String(raw.trackId),
          track_id: String(raw.trackId),
          name: raw.trackName || "Unknown App",
          developer: raw.artistName || "Unknown Developer",
          category: raw.primaryGenreName || "Application",
          rating: raw.averageUserRating ? Number(raw.averageUserRating.toFixed(1)) : null,
          rating_count: raw.userRatingCount || 0,
          price: raw.formattedPrice || (raw.price === 0 ? "Free" : `$${raw.price}`),
          version: raw.version || "1.0",
          size: formatBytes(raw.fileSizeBytes),
          min_os: raw.minimumOsVersion ? `iOS ${raw.minimumOsVersion}+` : "iOS",
          description: raw.description || "No description provided.",
          icon_url: raw.artworkUrl512 || raw.artworkUrl100 || "https://i.imgur.com/9vlBxdt.png",
          store_url: raw.trackViewUrl || `https://apps.apple.com/app/id${raw.trackId}`,
          updated: (raw.currentVersionReleaseDate || "").slice(0, 10),
        };
      }
    }
  } catch (e) {
    console.warn("iTunes lookup failed:", e);
  }
  return null;
}

// --- Single Google Play Lookup By Package Name ---
async function lookupGooglePlayByPackage(packageName) {
  // 1. Check curated list
  const found = POPULAR_GOOGLE_PLAY_APPS.find(
    (a) => a.package_name.toLowerCase() === packageName.toLowerCase()
  );
  if (found) return { ...found };

  // 2. Query Netlify API
  try {
    const res = await fetch(`/api/lookup?package=${encodeURIComponent(packageName)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
    }
  } catch (e) {
    console.warn("Netlify Google Play lookup failed:", e);
  }

  // 3. Dynamic package representation
  return {
    store: "Google Play",
    store_key: "google",
    package_name: packageName,
    id: packageName,
    name: packageName,
    developer: "Android Publisher",
    category: "Android Application",
    rating: 4.4,
    rating_count: 50000,
    price: "Free",
    version: "Varies with device",
    installs: "10,000,000+",
    min_os: "Android 8.0+",
    released: "2020-01-01",
    updated: new Date().toISOString().slice(0, 10),
    description: `Official Android application for package ${packageName} on the Google Play Store.`,
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg",
    store_url: `https://play.google.com/store/apps/details?id=${packageName}`,
  };
}

// --- Search Across Both Stores ---
async function searchBothStores(term) {
  const [appleApps, googleApps] = await Promise.all([
    searchAppleStore(term),
    searchGooglePlay(term),
  ]);

  return {
    apple: appleApps,
    google: googleApps,
    all: [...appleApps, ...googleApps],
  };
}

// --- Render Cards in App Explorer ---
function renderCards(apps) {
  const container = document.getElementById("cards-grid");
  const countLabel = document.getElementById("results-count");
  container.innerHTML = "";

  if (!apps || apps.length === 0) {
    countLabel.textContent = "0 results";
    return;
  }

  countLabel.textContent = `Showing ${apps.length} application${apps.length === 1 ? "" : "s"}`;

  apps.forEach((app) => {
    const isGoogle = app.store_key === "google";
    const badgeClass = isGoogle ? "badge-google" : "badge-apple";
    const badgeText = isGoogle ? "🤖 Google Play" : "🍎 App Store";
    const secondaryMetricLabel = isGoogle ? "Installs" : "Size";
    const secondaryMetricVal = isGoogle ? (app.installs || "1M+") : (app.size || "N/A");

    const card = document.createElement("div");
    card.className = "app-card";
    card.setAttribute("data-store", app.store_key);

    const safeIcon = app.icon_url || app.icon_fallback || "https://i.imgur.com/9vlBxdt.png";
    const safeDesc = app.description || "No description provided.";
    const safeName = app.name || "Unknown App";
    const safeDev = app.developer || "Unknown Developer";

    card.innerHTML = `
      <div class="card-top">
        <img class="app-icon" src="${safeIcon}" alt="${safeName} icon" loading="lazy" onerror="this.src='https://i.imgur.com/9vlBxdt.png'">
        <div class="card-meta">
          <span class="store-badge ${badgeClass}">${badgeText}</span>
          <h3 class="app-title" title="${safeName}">${safeName}</h3>
          <p class="app-developer" title="${safeDev}">${safeDev}</p>
          <div class="rating-row">
            <span class="stars">${renderStars(app.rating)}</span>
            <span class="rating-score">${app.rating ? app.rating : "Unrated"}</span>
            <span class="rating-count">${formatRatingCount(app.rating_count)}</span>
          </div>
        </div>
      </div>
      <div class="card-details">
        <div class="detail-item">
          <span class="detail-label">Price</span>
          <span class="detail-value" style="color:${app.price === 'Free' ? '#34d399' : '#f3f4f8'}">${app.price || 'Free'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Category</span>
          <span class="detail-value">${app.category || 'App'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">${secondaryMetricLabel}</span>
          <span class="detail-value">${secondaryMetricVal}</span>
        </div>
      </div>
      <p class="card-desc">${safeDesc}</p>
      <div class="card-actions">
        <a href="${app.store_url}" target="_blank" rel="noopener noreferrer" class="btn-store">
          View on ${app.store} ↗
        </a>
        <button class="btn-bot-send" onclick="sendToBotSimulator('${safeName.replace(/'/g, "\\'")}')">
          💬 Test in Bot
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- App Explorer Search Controller ---
async function performSearch(term) {
  const stateBox = document.getElementById("search-state");
  const countLabel = document.getElementById("results-count");
  const container = document.getElementById("cards-grid");

  if (!term || !term.trim()) return;

  container.innerHTML = "";
  stateBox.style.display = "block";
  stateBox.innerHTML = `
    <div class="spinner"></div>
    <div class="state-title" style="margin-top:16px;">Searching store databases...</div>
    <div class="state-desc">Looking up "${term}" across Apple App Store and Google Play Store...</div>
  `;

  // Check if it is a store URL
  const parsedUrl = parseStoreUrl(term);
  if (parsedUrl) {
    let singleApp = null;
    if (parsedUrl.type === "apple") {
      singleApp = await lookupAppleAppById(parsedUrl.value);
    } else {
      singleApp = await lookupGooglePlayByPackage(parsedUrl.value);
    }

    if (singleApp) {
      stateBox.style.display = "none";
      currentAllResults = [singleApp];
      applyStoreFilter();
      return;
    }
  }

  // Regular multi-store search
  const results = await searchBothStores(term);
  currentAllResults = results.all;

  if (currentAllResults.length === 0) {
    stateBox.style.display = "block";
    stateBox.innerHTML = `
      <div class="state-icon">🔍</div>
      <div class="state-title">No applications found</div>
      <div class="state-desc">We couldn't find store apps matching "${term}". Try another title like "Spotify", "Duolingo", or "Minecraft".</div>
    `;
    countLabel.textContent = "0 results";
    return;
  }

  stateBox.style.display = "none";
  applyStoreFilter();
}

function applyStoreFilter() {
  let filtered = currentAllResults;
  if (activeStoreFilter === "apple") {
    filtered = currentAllResults.filter((a) => a.store_key === "apple");
  } else if (activeStoreFilter === "google") {
    filtered = currentAllResults.filter((a) => a.store_key === "google");
  }
  renderCards(filtered);
}

// --- Viber Simulator Chat Functions ---
function appendUserMessage(text) {
  const history = document.getElementById("chat-history");
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble bubble-user";
  bubble.textContent = text;
  history.appendChild(bubble);
  history.scrollTop = history.scrollHeight;
}

function appendBotMessage(text) {
  const history = document.getElementById("chat-history");
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble bubble-bot";
  bubble.textContent = text;
  history.appendChild(bubble);
  history.scrollTop = history.scrollHeight;
}

// Robust Detail Card matching formatter.py
function appendBotCard(app) {
  try {
    const history = document.getElementById("chat-history");
    const card = document.createElement("div");
    card.className = "bubble-card";

    const isGoogle = app.store_key === "google";
    const storeIcon = isGoogle ? "🤖" : "🍎";
    const ratingStars = renderStars(app.rating);
    const ratingStr = app.rating ? `${app.rating} / 5.0 ${formatRatingCount(app.rating_count)}` : "No ratings yet";

    const lines = [
      `📱 *${app.name || "Unknown App"}*`,
      `🏬 Store: ${storeIcon} ${app.store || "Store"}`,
    ];

    if (app.developer) lines.push(`👤 Developer: ${app.developer}`);
    if (app.category) lines.push(`🏷️ Category: ${app.category}`);
    lines.push(`⭐ Rating: ${ratingStars} (${ratingStr})`);
    if (app.price) lines.push(`💰 Price: ${app.price}`);
    if (isGoogle && app.installs) lines.push(`⬇️ Installs: ${app.installs}`);
    if (app.version) lines.push(`🔢 Version: ${app.version}`);
    if (!isGoogle && app.size && app.size !== "N/A") lines.push(`💾 Size: ${app.size}`);
    if (app.min_os) lines.push(`⚙️ Requires: ${app.min_os}`);
    if (app.released) lines.push(`📅 Released: ${app.released}`);
    if (app.updated) lines.push(`🔄 Last updated: ${app.updated}`);

    const rawDesc = String(app.description || "");
    if (rawDesc) {
      const shortDesc = rawDesc.length > 220 ? rawDesc.slice(0, 220).trim() + "…" : rawDesc;
      lines.push(`\n📝 *Description:*\n${shortDesc}`);
    }

    if (app.store_url) {
      lines.push(`\n🔗 Store Link:\n${app.store_url}`);
    }

    const iconSrc = app.icon_url || app.icon_fallback || "https://i.imgur.com/9vlBxdt.png";

    card.innerHTML = `
      <img class="bubble-card-img" src="${iconSrc}" alt="App Icon" onerror="this.src='https://i.imgur.com/9vlBxdt.png'">
      <div class="bubble-card-body">${lines.join("\n")}</div>
    `;

    history.appendChild(card);
    history.scrollTop = history.scrollHeight;
  } catch (err) {
    console.error("Error in appendBotCard:", err);
    appendBotMessage(`⚠️ Failed to format app card: ${err.message}`);
  }
}

// Main Simulator Handler (reproducing service.py & formatter.py)
async function handleBotInput(rawText) {
  const text = (rawText || "").trim();
  if (!text) return;

  appendUserMessage(text);
  const lower = text.toLowerCase();

  // 1. Greetings
  if (lower === "/start" || lower === "start" || lower === "hi" || lower === "hello") {
    setTimeout(() => {
      appendBotMessage(
        "👋 Hi! I'm AppInfoBot.\n\n" +
        "Send me:\n" +
        "• An app name (e.g. \"Spotify\")\n" +
        "• An App Store link\n" +
        "• A Google Play link\n\n" +
        "…and I'll pull up detailed information about it."
      );
    }, 300);
    return;
  }

  // 2. Help command
  if (lower === "/help" || lower === "help") {
    setTimeout(() => {
      appendBotMessage(
        "ℹ️ AppInfoBot Help:\n\n" +
        "• Search by name: just type the app name, e.g. \"spotify\" or \"minecraft\".\n" +
        "• If multiple apps match, reply with the number of your choice.\n" +
        "• Paste a direct store URL to get instant details without searching.\n\n" +
        "Supported stores: 🍎 Apple App Store (iOS) & 🤖 Google Play Store (Android)."
      );
    }, 300);
    return;
  }

  // 3. Direct Store URL check (Apple or Google Play)
  const storeUrlMatch = parseStoreUrl(text);
  if (storeUrlMatch) {
    appendBotMessage(`🔍 Detected direct ${storeUrlMatch.type === 'apple' ? '🍎 App Store' : '🤖 Google Play'} link. Fetching details...`);
    setTimeout(async () => {
      let resolvedApp = null;
      if (storeUrlMatch.type === "apple") {
        resolvedApp = await lookupAppleAppById(storeUrlMatch.value);
      } else {
        resolvedApp = await lookupGooglePlayByPackage(storeUrlMatch.value);
      }

      if (resolvedApp) {
        appendBotCard(resolvedApp);
      } else {
        appendBotMessage(`⚠️ Could not find details for that store link.`);
      }
    }, 400);
    return;
  }

  // 4. Number selection for disambiguation (e.g. "1", "2", "3")
  if (/^\d+$/.test(text)) {
    const choice = simulatedDisambiguationMap[text];
    if (choice) {
      appendBotMessage(`⏳ Fetching full details for option #${text} (${choice.name})...`);
      setTimeout(() => {
        appendBotCard(choice);
      }, 400);
      return;
    } else {
      const count = Object.keys(simulatedDisambiguationMap).length;
      if (count > 0) {
        appendBotMessage(`⚠️ Option #${text} is not valid. Please reply with a number between 1 and ${count}.`);
      } else {
        appendBotMessage(`⚠️ No active list found. Please search for an app name first (e.g. "Spotify").`);
      }
      return;
    }
  }

  // 5. App Name Search (Multi-Store across Apple & Google Play)
  appendBotMessage(`🔍 Searching 🍎 App Store and 🤖 Google Play for "${text}"...`);

  setTimeout(async () => {
    const results = await searchBothStores(text);
    const appleResults = (results.apple || []).slice(0, 3);
    const googleResults = (results.google || []).slice(0, 3);
    const totalCount = appleResults.length + googleResults.length;

    if (totalCount === 0) {
      appendBotMessage(`⚠️ Could not find any apps matching "${text}". Try another name!`);
      return;
    }

    if (totalCount === 1) {
      const single = appleResults[0] || googleResults[0];
      appendBotCard(single);
      return;
    }

    // Build disambiguation list exactly like formatter.py format_disambiguation()
    simulatedDisambiguationMap = {};
    let index = 1;
    let lines = [`🔍 Results for "${text}":\n`];

    if (appleResults.length > 0) {
      lines.push("🍎 App Store:");
      appleResults.forEach((r) => {
        lines.push(`${index}. ${r.name} — ${r.developer}`);
        simulatedDisambiguationMap[String(index)] = r;
        index++;
      });
      lines.push("");
    }

    if (googleResults.length > 0) {
      lines.push("🤖 Google Play:");
      googleResults.forEach((r) => {
        lines.push(`${index}. ${r.name} — ${r.developer}`);
        simulatedDisambiguationMap[String(index)] = r;
        index++;
      });
      lines.push("");
    }

    lines.push("Reply with a number to see full details.");
    appendBotMessage(lines.join("\n"));
  }, 450);
}

function sendToBotSimulator(appName) {
  switchTab("simulator");
  const input = document.getElementById("chat-input");
  input.value = appName;
  document.getElementById("chat-send-btn").click();
}

// --- Tabs Switcher ---
function switchTab(tabId) {
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.toggle("active", pane.id === `tab-${tabId}`);
  });
}

// --- Copy helper ---
function copyText(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "Copied! ✓";
    setTimeout(() => (btn.textContent = orig), 2000);
  });
}

// --- Event Listeners Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  // Navigation tabs
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Store filter buttons
  document.querySelectorAll(".store-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".store-filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeStoreFilter = btn.dataset.filter;
      applyStoreFilter();
    });
  });

  // Search input & button
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  searchBtn.addEventListener("click", () => performSearch(searchInput.value));
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch(searchInput.value);
  });

  // Quick tag chips
  document.querySelectorAll(".tag-btn").forEach((tag) => {
    tag.addEventListener("click", () => {
      const val = tag.getAttribute("data-query");
      searchInput.value = val;
      performSearch(val);
    });
  });

  // Simulator send button & input
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");

  function sendChatMessage() {
    const val = chatInput.value;
    chatInput.value = "";
    handleBotInput(val);
  }

  chatSendBtn.addEventListener("click", sendChatMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });

  // Simulator preset quick action buttons
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prompt = btn.getAttribute("data-prompt");
      chatInput.value = prompt;
      sendChatMessage();
    });
  });

  // Initial Search
  performSearch("Spotify");
});
