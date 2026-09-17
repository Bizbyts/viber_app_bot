# Viber App Info Bot

A production-ready Viber chatbot that looks up detailed information about
mobile apps. Send it an app name or a direct App Store / Google Play link,
and it replies with ratings, price, size, developer, description, and more.

## Features

- **Two input modes**: free-text app name search, or a direct store URL.
- **Two stores**: Apple App Store (via the public iTunes Search/Lookup API)
  and Google Play (via `google-play-scraper`).
- **Disambiguation**: if a name search matches multiple apps, the bot lists
  them and lets the user pick by number.
- **Rich details**: name, developer, category, star rating, rating count,
  price, size, minimum OS, release/update dates, content rating, and a
  trimmed description — plus the app icon as an image.
- **In-memory TTL cache** to avoid hammering the store APIs on repeat lookups.
- **Robust webhook handling**: signature verification, safe error handling
  (always ACKs 200 so Viber won't retry-storm you), structured logging.
- **Unit tests** for the parsing and formatting logic (no live network needed).

## Project layout

```
viber_app_bot/
├── app.py                 # Flask app / webhook entry point
├── viber_client.py        # Viber SDK wrapper + event handlers
├── config.py               # Environment-based configuration
├── logger.py                # Logging setup
├── cache.py                  # Simple TTL cache (app info + per-user session)
├── set_webhook.py             # CLI to register/remove the Viber webhook
├── app_lookup/
│   ├── parser.py              # Detects search term vs App Store/Play URL
│   ├── itunes.py               # Apple App Store client
│   ├── google_play.py           # Google Play client
│   ├── formatter.py              # Builds the text sent back to the user
│   └── service.py                 # Orchestrates parser + clients + cache
├── tests/
│   ├── test_parser.py
│   └── test_formatter.py
├── requirements.txt
├── .env.example
└── Procfile                    # For Heroku/Render-style platforms
```

## Setup

### 1. Create a Viber bot

1. Go to the [Viber Partners Admin Panel](https://partners.viber.com/) and
   create a new Public Account / Bot.
2. Copy the **Authentication Token** shown for your bot.

### 2. Install dependencies

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
VIBER_AUTH_TOKEN=your-real-token
WEBHOOK_URL=https://your-public-domain.com/webhook
```

`WEBHOOK_URL` **must** be a public HTTPS URL — Viber will not call `http://`
or `localhost` addresses. For local development, use a tunnel:

```bash
ngrok http 5000
# then set WEBHOOK_URL to the https://xxxx.ngrok.io/webhook URL it gives you
```

### 4. Run it

```bash
python app.py
```

This starts the Flask dev server on `PORT` (default `5000`) and, if
`WEBHOOK_URL` is set, automatically registers it with Viber on startup.

You can also register/remove the webhook manually at any time:

```bash
python set_webhook.py set https://your-domain.com/webhook
python set_webhook.py unset
```

### 5. Test it

Open the bot in Viber and send:

- `spotify` → search across both stores
- `https://apps.apple.com/us/app/spotify/id324684580` → direct App Store lookup
- `https://play.google.com/store/apps/details?id=com.spotify.music` → direct Google Play lookup
- `/help` → usage instructions

## Running tests

```bash
pip install pytest
pytest tests/ -v
```

The tests cover URL/search-term parsing and message formatting; they don't
hit live network APIs, so they run anywhere, including CI.

## Production deployment

Use a real WSGI server instead of Flask's dev server:

```bash
gunicorn -w 2 -b 0.0.0.0:$PORT app:flask_app
```

The included `Procfile` does exactly this, so the project deploys as-is to
Heroku, Render, Railway, Fly.io, or similar platforms. Just:

1. Set `VIBER_AUTH_TOKEN` and `WEBHOOK_URL` (pointing at the platform's
   public URL + `/webhook`) as environment variables on the platform.
2. Deploy.
3. Run `python set_webhook.py set` once (or let the platform run `app.py`
   directly on first boot, which registers it automatically).

### Notes on scaling

- The in-memory `TTLCache` in `cache.py` is per-process. If you run multiple
  workers/instances, each has its own cache — harmless (just less cache
  hit-rate), but if you want a shared cache, swap `TTLCache` for a small
  Redis-backed implementation; the `get`/`set` interface is designed to make
  that a drop-in change.
- Outbound calls to `itunes.apple.com` and Google Play must be allowed by
  your hosting environment's network/firewall rules.

## How lookups work

1. **Parsing** (`app_lookup/parser.py`): user text is classified as a plain
   search term, an Apple App Store URL (extracting the numeric track id), or
   a Google Play URL (extracting the package name).
2. **Fetching** (`itunes.py` / `google_play.py`): the appropriate store
   API is called and the raw response normalized into a common schema
   (name, developer, rating, price, size, description, icon, store URL...).
3. **Disambiguation**: a plain search term queries both stores; if there's
   more than one combined result, the bot shows a numbered list and
   remembers it (5-minute TTL, per user) so a follow-up number reply
   resolves to the right app.
4. **Formatting** (`formatter.py`): the normalized data is rendered into an
   emoji-labeled text block, with the app icon sent as an attached image
   when available.

## Extending

- **More stores** (e.g. Microsoft Store): add a new client module following
  the same `search()` / `lookup_by_x()` → normalized-dict pattern used by
  `itunes.py`, then wire it into `service.py` and `parser.py`.
- **Persistent cache / analytics**: swap `cache.py`'s `TTLCache` for Redis,
  or add a database layer in `service.py` to log lookups.
- **Rich Viber messages**: `viber_client.py` currently sends `PictureMessage`
  for detail results; you can extend this to Viber's Rich Media (carousel)
  messages for the multi-result picker instead of a numbered text list.
# viber_app_bot
# viber_app_bot
