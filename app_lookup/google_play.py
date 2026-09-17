"""
Client for Google Play app data.
Uses the `google-play-scraper` package, which reads the same public data
the Play Store web page shows (no official Google API key needed).
"""
from typing import List, Optional, Dict, Any

from google_play_scraper import app as gp_app_details
from google_play_scraper import search as gp_search
from google_play_scraper.exceptions import NotFoundError

from config import Config
from logger import log


class GooglePlayError(Exception):
    pass


def _normalize(raw: Dict[str, Any]) -> Dict[str, Any]:
    price = "Free" if raw.get("free") else raw.get("priceText", "Paid")
    return {
        "store": "Google Play",
        "name": raw.get("title"),
        "developer": raw.get("developer"),
        "category": raw.get("genre"),
        "rating": raw.get("score"),
        "rating_count": raw.get("ratings"),
        "price": price,
        "version": raw.get("version") or "Varies with device",
        "size_bytes": None,  # not reliably exposed by the Play Store anymore
        "installs": raw.get("installs"),
        "min_os": raw.get("androidVersionText") or raw.get("androidVersion"),
        "released": raw.get("released"),
        "updated": raw.get("updated"),  # unix timestamp or ISO depending on lib version
        "description": raw.get("description"),
        "icon_url": raw.get("icon"),
        "store_url": raw.get("url"),
        "content_rating": raw.get("contentRating"),
        "package_name": raw.get("appId"),
    }


def lookup_by_package(package_name: str) -> Optional[Dict[str, Any]]:
    """Fetch a single app by its Android package name (e.g. com.spotify.music)."""
    try:
        raw = gp_app_details(
            package_name,
            lang=Config.DEFAULT_LANG,
            country=Config.DEFAULT_COUNTRY,
        )
    except NotFoundError:
        return None
    except Exception as exc:  # library raises assorted errors on network/parsing issues
        log.error("Google Play lookup failed for package=%s: %s", package_name, exc)
        raise GooglePlayError("Could not reach Google Play right now.") from exc

    return _normalize(raw)


def search(term: str, limit: int = None) -> List[Dict[str, Any]]:
    """Search Google Play by free-text term. Returns a list of normalized apps."""
    limit = limit or Config.SEARCH_RESULTS_LIMIT
    try:
        results = gp_search(
            term,
            lang=Config.DEFAULT_LANG,
            country=Config.DEFAULT_COUNTRY,
            n_hits=limit,
        )
    except Exception as exc:
        log.error("Google Play search failed for term=%r: %s", term, exc)
        raise GooglePlayError("Could not reach Google Play right now.") from exc

    # search() returns lighter records; fetch full details for the top result only
    # to keep latency reasonable, and normalize the rest with what we have.
    normalized = []
    for r in results:
        normalized.append({
            "store": "Google Play",
            "name": r.get("title"),
            "developer": r.get("developer"),
            "category": r.get("genre"),
            "rating": r.get("score"),
            "rating_count": r.get("ratings"),
            "price": "Free" if r.get("free") else r.get("priceText", "Paid"),
            "icon_url": r.get("icon"),
            "store_url": r.get("url"),
            "package_name": r.get("appId"),
        })
    return normalized
