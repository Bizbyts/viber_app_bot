"""
High-level orchestration layer. This is what the bot's message handler
calls; it hides the details of which store API(s) were used.
"""
from typing import Tuple, Union, Dict, List

from .parser import parse_user_input, QueryType
from . import itunes
from . import google_play
from .formatter import format_app_details, format_search_results, format_error
from cache import app_info_cache
from logger import log


class LookupResult:
    """
    Wraps the outcome of a lookup so the caller can decide how to render it.
    kind is one of: "detail", "choices", "error"
    """
    def __init__(self, kind: str, text: str, choices: Dict[str, tuple] = None, icon_url: str = None):
        self.kind = kind
        self.text = text
        self.choices = choices or {}
        self.icon_url = icon_url


def resolve(user_text: str) -> LookupResult:
    """Main entry point: takes raw user text, returns a LookupResult."""
    try:
        query = parse_user_input(user_text)
    except ValueError as exc:
        return LookupResult("error", format_error(str(exc)))

    cache_key = f"{query.query_type.value}:{query.value.lower()}"
    cached = app_info_cache.get(cache_key)
    if cached:
        log.info("Cache hit for %s", cache_key)
        return cached

    if query.query_type == QueryType.APPLE_URL:
        result = _resolve_apple_id(query.value)
    elif query.query_type == QueryType.GOOGLE_URL:
        result = _resolve_google_package(query.value)
    else:
        result = _resolve_search_term(query.value)

    app_info_cache.set(cache_key, result)
    return result


def resolve_choice(store: str, identifier: str) -> LookupResult:
    """Called when a user replies with a number picking one of several search results."""
    if store == "apple":
        return _resolve_apple_id(identifier)
    return _resolve_google_package(identifier)


def _resolve_apple_id(track_id: str) -> LookupResult:
    try:
        info = itunes.lookup_by_id(track_id)
    except itunes.ITunesError as exc:
        return LookupResult("error", format_error(str(exc)))
    if not info:
        return LookupResult("error", format_error("I couldn't find that app on the App Store."))
    return LookupResult("detail", format_app_details(info), icon_url=info.get("icon_url"))


def _resolve_google_package(package_name: str) -> LookupResult:
    try:
        info = google_play.lookup_by_package(package_name)
    except google_play.GooglePlayError as exc:
        return LookupResult("error", format_error(str(exc)))
    if not info:
        return LookupResult("error", format_error("I couldn't find that app on Google Play."))
    return LookupResult("detail", format_app_details(info), icon_url=info.get("icon_url"))


def _resolve_search_term(term: str) -> LookupResult:
    apple_results, google_results = [], []
    errors = []

    try:
        apple_results = itunes.search(term)
    except itunes.ITunesError as exc:
        errors.append(str(exc))

    try:
        google_results = google_play.search(term)
    except google_play.GooglePlayError as exc:
        errors.append(str(exc))

    if not apple_results and not google_results:
        if errors:
            return LookupResult("error", format_error(" / ".join(errors)))
        text, _ = format_search_results(term, [], [])
        return LookupResult("error", text)

    # Exactly one total match -> show full details directly, skip the picker.
    total = apple_results + google_results
    if len(total) == 1:
        only = total[0]
        return LookupResult("detail", format_app_details(only), icon_url=only.get("icon_url"))

    text, numbered_map = format_search_results(term, apple_results, google_results)
    return LookupResult("choices", text, choices=numbered_map)
