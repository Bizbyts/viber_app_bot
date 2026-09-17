"""
Client for Apple's public iTunes Search API.
Docs: https://performance-partners.apple.com/search-api
No API key is required.
"""
from typing import List, Optional, Dict, Any
import requests

from config import Config
from logger import log

SEARCH_URL = "https://itunes.apple.com/search"
LOOKUP_URL = "https://itunes.apple.com/lookup"


class ITunesError(Exception):
    pass


def _normalize(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a raw iTunes API result into our common app-info schema."""
    price = raw.get("formattedPrice") or (
        "Free" if raw.get("price") == 0 else f'${raw.get("price", "?")}'
    )
    return {
        "store": "App Store",
        "track_id": str(raw.get("trackId")) if raw.get("trackId") is not None else None,
        "name": raw.get("trackName"),
        "developer": raw.get("artistName"),
        "category": raw.get("primaryGenreName"),
        "rating": raw.get("averageUserRating"),
        "rating_count": raw.get("userRatingCount"),
        "price": price,
        "version": raw.get("version"),
        "size_bytes": raw.get("fileSizeBytes"),
        "min_os": raw.get("minimumOsVersion"),
        "released": (raw.get("releaseDate") or "")[:10],
        "updated": (raw.get("currentVersionReleaseDate") or "")[:10],
        "description": raw.get("description"),
        "icon_url": raw.get("artworkUrl512") or raw.get("artworkUrl100"),
        "store_url": raw.get("trackViewUrl"),
        "content_rating": raw.get("contentAdvisoryRating"),
        "languages": raw.get("languageCodesISO2A", []),
    }


def lookup_by_id(track_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single app by its numeric App Store track id."""
    try:
        resp = requests.get(
            LOOKUP_URL,
            params={"id": track_id, "country": Config.DEFAULT_COUNTRY, "entity": "software"},
            timeout=Config.REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        log.error("iTunes lookup_by_id failed for id=%s: %s", track_id, exc)
        raise ITunesError("Could not reach the App Store right now.") from exc

    results = data.get("results", [])
    if not results:
        return None
    return _normalize(results[0])


def search(term: str, limit: int = None) -> List[Dict[str, Any]]:
    """Search the App Store by free-text term. Returns a list of normalized apps."""
    limit = limit or Config.SEARCH_RESULTS_LIMIT
    try:
        resp = requests.get(
            SEARCH_URL,
            params={
                "term": term,
                "country": Config.DEFAULT_COUNTRY,
                "entity": "software",
                "limit": limit,
            },
            timeout=Config.REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        log.error("iTunes search failed for term=%r: %s", term, exc)
        raise ITunesError("Could not reach the App Store right now.") from exc

    return [_normalize(r) for r in data.get("results", [])]
