"""
Parses whatever a user sends into a structured lookup request:
  - a raw search term ("spotify")
  - an Apple App Store URL (apps.apple.com / itunes.apple.com)
  - a Google Play Store URL (play.google.com/store/apps/details?id=...)

The result is a ParsedQuery, which downstream code uses to decide which
store API(s) to call and with what identifier.
"""
import re
from dataclasses import dataclass
from enum import Enum
from urllib.parse import urlparse, parse_qs


class QueryType(Enum):
    SEARCH_TERM = "search_term"
    APPLE_URL = "apple_url"
    GOOGLE_URL = "google_url"


@dataclass
class ParsedQuery:
    query_type: QueryType
    # For SEARCH_TERM: the raw text to search with.
    # For APPLE_URL: the numeric App Store track id.
    # For GOOGLE_URL: the Android package name (bundle id).
    value: str
    raw_input: str


_APPLE_HOST_RE = re.compile(r"(itunes|apps)\.apple\.com", re.IGNORECASE)
_APPLE_ID_RE = re.compile(r"/id(\d+)", re.IGNORECASE)
_GOOGLE_HOST_RE = re.compile(r"play\.google\.com", re.IGNORECASE)
_URL_RE = re.compile(r"^https?://", re.IGNORECASE)


def parse_user_input(text: str) -> ParsedQuery:
    """
    Classify raw user text into a ParsedQuery.
    Raises ValueError if a recognized store URL is malformed (e.g. missing id).
    """
    text = (text or "").strip()
    if not text:
        raise ValueError("Empty input")

    if _URL_RE.match(text):
        parsed = urlparse(text)

        if _APPLE_HOST_RE.search(parsed.netloc):
            match = _APPLE_ID_RE.search(parsed.path)
            if not match:
                # Some Apple links use ?id=123456789 instead of /id123456789
                qs = parse_qs(parsed.query)
                if "id" in qs and qs["id"][0].isdigit():
                    return ParsedQuery(QueryType.APPLE_URL, qs["id"][0], text)
                raise ValueError(
                    "This looks like an App Store link, but I couldn't find "
                    "the app id in it."
                )
            return ParsedQuery(QueryType.APPLE_URL, match.group(1), text)

        if _GOOGLE_HOST_RE.search(parsed.netloc):
            qs = parse_qs(parsed.query)
            if "id" not in qs or not qs["id"][0]:
                raise ValueError(
                    "This looks like a Google Play link, but I couldn't find "
                    "the package id in it."
                )
            return ParsedQuery(QueryType.GOOGLE_URL, qs["id"][0], text)

        # A URL, but not one we recognize as a store link.
        raise ValueError(
            "I can only read links from the Apple App Store or Google Play. "
            "Try sending an app name instead."
        )

    # Not a URL -> treat as a free-text search term.
    return ParsedQuery(QueryType.SEARCH_TERM, text, text)
