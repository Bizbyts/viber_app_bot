/**
 * AppInfoBot - Client-side App Search Engine & Viber Bot Simulator
 */

// --- Global State ---
let activeSearchSession = null;
let simulatedDisambiguationMap = {};

// --- Helper Functions ---
function formatBytes(bytes) {
  if (!bytes) return "N/A";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function renderStars(rating) {
  if (!rating) return "☆☆☆☆☆";
  const rounded = Math.round(rating);
  let stars = "";
  for (let i = 0; i < 5; i++) {
    stars += i < rounded ? "★" : "☆";
  }
  return stars;
}

function formatRatingCount(count) {
  if (!count) return "";
  if (count >= 1000000) return `(${(count / 1000000).toFixed(1)}M)`;
  if (count >= 1000) return `(${(count / 1000).toFixed(0)}k)`;
  return `(${count})`;
}

// --- Live iTunes / App Store Search ---
async function searchApps(query) {
  if (!query || !query.trim()) return [];

  // Try direct iTunes Search API first (CORS is open on itunes.apple.com)
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query.trim()
    )}&entity=software&limit=9`;
    const res = await fetch(itunesUrl);
    if (res.ok) {
      const data = await res.json();
      return (data.results || []).map((raw) => ({
        store: "App Store",
        id: String(raw.trackId),
        name: raw.trackName,
        developer: raw.artistName,
        category: raw.primaryGenreName,
        rating: raw.averageUserRating ? Number(raw.averageUserRating.toFixed(1)) : null,
        rating_count: raw.userRatingCount,
        price: raw.formattedPrice || (raw.price === 0 ? "Free" : `$${raw.price}`),
        version: raw.version || "1.0",
        size: formatBytes(raw.fileSizeBytes),
        min_os: raw.minimumOsVersion ? `iOS ${raw.minimumOsVersion}+` : "iOS",
        description: raw.description || "No description provided.",
        icon_url: raw.artworkUrl512 || raw.artworkUrl100 || "https://i.imgur.com/9vlBxdt.png",
        store_url: raw.trackViewUrl,
        updated: (raw.currentVersionReleaseDate || "").slice(0, 10),
      }));
    }
  } catch (err) {
    console.warn("Direct iTunes query failed, trying /api/lookup...", err);
  }

  // Fallback to Netlify function if available
  try {
    const netlifyRes = await fetch(`/api/lookup?q=${encodeURIComponent(query.trim())}`);
    if (netlifyRes.ok) {
      const data = await netlifyRes.json();
      return data.results || [];
    }
  } catch (e) {
    console.error("Lookup fallback failed:", e);
  }

  return [];
}

// --- Render Search Results in App Explorer ---
async function performSearch(term) {
  const container = document.getElementById("cards-grid");
  const stateBox = document.getElementById("search-state");
  const countLabel = document.getElementById("results-count");

  if (!term || !term.trim()) return;

  container.innerHTML = "";
  stateBox.style.display = "block";
  stateBox.innerHTML = `
    <div class="spinner"></div>
    <div class="state-title" style="margin-top:16px;">Searching store databases...</div>
    <div class="state-desc">Looking up "${term}" across Apple App Store...</div>
  `;

  const apps = await searchApps(term);

  if (apps.length === 0) {
    stateBox.style.display = "block";
    stateBox.innerHTML = `
      <div class="state-icon">🔍</div>
      <div class="state-title">No applications found</div>
      <div class="state-desc">We couldn't find any store apps matching "${term}". Try another title like "Spotify", "Duolingo", or "Slack".</div>
    `;
    countLabel.textContent = "0 results";
    return;
  }

  stateBox.style.display = "none";
  countLabel.textContent = `Showing ${apps.length} results`;

  apps.forEach((app) => {
    const card = document.createElement("div");
    card.className = "app-card";
    card.innerHTML = `
      <div class="card-top">
        <img class="app-icon" src="${app.icon_url}" alt="${app.name} icon" loading="lazy" onerror="this.src='https://i.imgur.com/9vlBxdt.png'">
        <div class="card-meta">
          <span class="store-badge badge-apple">🍎 App Store</span>
          <h3 class="app-title" title="${app.name}">${app.name}</h3>
          <p class="app-developer" title="${app.developer}">${app.developer}</p>
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
          <span class="detail-value" style="color:${app.price === 'Free' ? '#34d399' : '#f3f4f8'}">${app.price}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Category</span>
          <span class="detail-value">${app.category || 'App'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Size</span>
          <span class="detail-value">${app.size}</span>
        </div>
      </div>
      <p class="card-desc">${app.description}</p>
      <div class="card-actions">
        <a href="${app.store_url}" target="_blank" rel="noopener noreferrer" class="btn-store">
          View on Store ↗
        </a>
        <button class="btn-bot-send" onclick="sendToBotSimulator('${app.name.replace(/'/g, "\\'")}')">
          💬 Test in Bot
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Viber Simulator Engine ---
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

function appendBotCard(app) {
  const history = document.getElementById("chat-history");
  const card = document.createElement("div");
  card.className = "bubble-card";

  const stars = renderStars(app.rating);
  const ratingText = app.rating ? `${app.rating} / 5.0 ${formatRatingCount(app.rating_count)}` : "Unrated";

  const bodyText = 
`📱 ${app.name} (${app.store})
👨‍💻 Developer: ${app.developer}
📁 Category: ${app.category}
⭐ Rating: ${stars} ${ratingText}
💰 Price: ${app.price}
📦 Version: ${app.version}
💾 Size: ${app.size}
⚙️ Requires: ${app.min_os}
🗓️ Updated: ${app.updated}

📝 Description:
${app.description.slice(0, 180)}...

🔗 Store Link: ${app.store_url}`;

  card.innerHTML = `
    <img class="bubble-card-img" src="${app.icon_url}" alt="App Icon">
    <div class="bubble-card-body">${bodyText}</div>
  `;
  history.appendChild(card);
  history.scrollTop = history.scrollHeight;
}

async function handleBotInput(rawText) {
  const text = (rawText || "").trim();
  if (!text) return;

  appendUserMessage(text);

  const lower = text.toLowerCase();

  // 1. Welcome / greetings
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
    }, 400);
    return;
  }

  // 2. Help command
  if (lower === "/help" || lower === "help") {
    setTimeout(() => {
      appendBotMessage(
        "ℹ️ AppInfoBot Help:\n\n" +
        "• Search by name: just type the app name, e.g. \"spotify\" or \"minecraft\".\n" +
        "• If multiple apps match, reply with the number of your choice.\n" +
        "• Paste a store URL to get instant details without searching.\n\n" +
        "Supported stores: Apple App Store (iOS) & Google Play Store (Android)."
      );
    }, 400);
    return;
  }

  // 3. Number selection for disambiguation
  if (/^\d+$/.test(text)) {
    const choice = simulatedDisambiguationMap[text];
    if (choice) {
      appendBotMessage(`⏳ Fetching full details for option #${text}...`);
      setTimeout(() => {
        appendBotCard(choice);
      }, 500);
      return;
    }
  }

  // 4. App Name or Store Search
  setTimeout(async () => {
    appendBotMessage(`🔍 Searching App Store and Google Play for "${text}"...`);

    const apps = await searchApps(text);

    if (apps.length === 0) {
      appendBotMessage(`⚠️ Could not find any apps matching "${text}". Try a different name.`);
      return;
    }

    if (apps.length === 1) {
      appendBotCard(apps[0]);
      return;
    }

    // Disambiguation list (like formatter.py)
    simulatedDisambiguationMap = {};
    let msg = `🔍 Results for "${text}":\n\n🍎 App Store:\n`;

    apps.slice(0, 5).forEach((item, idx) => {
      const num = idx + 1;
      simulatedDisambiguationMap[String(num)] = item;
      msg += `${num}. ${item.name} — ${item.developer}\n`;
    });

    msg += "\nReply with a number (1-5) to see full details.";
    appendBotMessage(msg);
  }, 500);
}

function sendToBotSimulator(appName) {
  // Switch to simulator tab
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

// --- DOM Initializer ---
document.addEventListener("DOMContentLoaded", () => {
  // Tab buttons
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
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

  // Simulator send
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

  // Preset buttons in simulator sidebar
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prompt = btn.getAttribute("data-prompt");
      chatInput.value = prompt;
      sendChatMessage();
    });
  });

  // Initial demo search
  performSearch("Spotify");
});
