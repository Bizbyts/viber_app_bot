"""
Configuration for the Viber App Information Bot.
All values are read from environment variables so the same code works
locally (.env file) and in production (real environment variables).
"""
import os

try:
    # Optional: loads a local .env file if python-dotenv is installed.
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def _bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


class Config:
    # --- Viber bot identity & auth ---
    VIBER_AUTH_TOKEN = os.environ.get("VIBER_AUTH_TOKEN", "")
    BOT_NAME = os.environ.get("BOT_NAME", "AppInfoBot")
    BOT_AVATAR = os.environ.get(
        "BOT_AVATAR", "https://i.imgur.com/9vlBxdt.png"
    )

    # --- Webhook / server ---
    WEBHOOK_URL = os.environ.get("WEBHOOK_URL", "")  # e.g. https://yourdomain.com/webhook
    HOST = os.environ.get("HOST", "0.0.0.0")
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = _bool(os.environ.get("DEBUG"), default=False)

    # --- Behaviour ---
    REQUEST_TIMEOUT = int(os.environ.get("REQUEST_TIMEOUT", 10))       # seconds, for outbound HTTP calls
    DEFAULT_COUNTRY = os.environ.get("DEFAULT_COUNTRY", "us")          # iTunes storefront country
    DEFAULT_LANG = os.environ.get("DEFAULT_LANG", "en")                 # Google Play language
    SEARCH_RESULTS_LIMIT = int(os.environ.get("SEARCH_RESULTS_LIMIT", 5))
    CACHE_TTL_SECONDS = int(os.environ.get("CACHE_TTL_SECONDS", 600))   # 10 min in-memory cache

    # --- Logging ---
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FILE = os.environ.get("LOG_FILE", "")  # empty = stdout only

    @classmethod
    def validate(cls):
        missing = []
        if not cls.VIBER_AUTH_TOKEN:
            missing.append("VIBER_AUTH_TOKEN")
        if missing:
            raise RuntimeError(
                f"Missing required environment variables: {', '.join(missing)}. "
                f"Copy .env.example to .env and fill in the values."
            )
