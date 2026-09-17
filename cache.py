"""
A tiny in-memory, thread-safe, TTL cache.

For a production deployment with multiple worker processes/instances,
swap this out for Redis — the interface (get/set) is intentionally
minimal so that's a drop-in change.
"""
import time
import threading
from typing import Any, Optional

from config import Config


class TTLCache:
    def __init__(self, ttl_seconds: int = None):
        self._ttl = ttl_seconds or Config.CACHE_TTL_SECONDS
        self._store = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            item = self._store.get(key)
            if not item:
                return None
            value, expires_at = item
            if time.time() > expires_at:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._store[key] = (value, time.time() + self._ttl)

    def clear_expired(self) -> None:
        with self._lock:
            now = time.time()
            expired = [k for k, (_, exp) in self._store.items() if now > exp]
            for k in expired:
                del self._store[k]


# Shared cache instances used across the app.
app_info_cache = TTLCache()          # caches resolved app-info dicts
user_session_cache = TTLCache(ttl_seconds=300)  # caches "last search results" per user, 5 min
