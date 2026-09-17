"""
Turns normalized app-info dictionaries (see itunes.py / google_play.py)
into human-readable text for Viber messages.
"""
from typing import Dict, Any, List


def _human_size(size_bytes) -> str:
    if not size_bytes:
        return "N/A"
    try:
        size_bytes = float(size_bytes)
    except (TypeError, ValueError):
        return "N/A"
    for unit in ("B", "KB", "MB", "GB"):
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"


def _star_bar(rating) -> str:
    if rating is None:
        return "No ratings yet"
    try:
        rating = float(rating)
    except (TypeError, ValueError):
        return "No ratings yet"
    full = round(rating)
    return "⭐" * full + "☆" * (5 - full) + f"  ({rating:.1f}/5)"


def format_app_details(info: Dict[str, Any]) -> str:
    """Build the full detail message for a single app."""
    lines = [f"📱 *{info.get('name', 'Unknown app')}*"]
    lines.append(f"🏬 Store: {info.get('store')}")
    if info.get("developer"):
        lines.append(f"👤 Developer: {info['developer']}")
    if info.get("category"):
        lines.append(f"🏷️ Category: {info['category']}")
    lines.append(f"⭐ Rating: {_star_bar(info.get('rating'))}")
    if info.get("rating_count"):
        lines.append(f"🗳️ Ratings count: {info['rating_count']:,}")
    if info.get("price"):
        lines.append(f"💰 Price: {info['price']}")
    if info.get("installs"):
        lines.append(f"⬇️ Installs: {info['installs']}")
    if info.get("version"):
        lines.append(f"🔢 Version: {info['version']}")
    size = _human_size(info.get("size_bytes"))
    if size != "N/A":
        lines.append(f"💾 Size: {size}")
    if info.get("min_os"):
        lines.append(f"⚙️ Requires: {info['min_os']}")
    if info.get("released"):
        lines.append(f"📅 Released: {info['released']}")
    if info.get("updated"):
        lines.append(f"🔄 Last updated: {info['updated']}")
    if info.get("content_rating"):
        lines.append(f"🔞 Content rating: {info['content_rating']}")

    description = (info.get("description") or "").strip()
    if description:
        if len(description) > 400:
            description = description[:400].rsplit(" ", 1)[0] + "…"
        lines.append("\n📝 " + description)

    if info.get("store_url"):
        lines.append(f"\n🔗 {info['store_url']}")

    return "\n".join(lines)


def format_search_results(term: str, apple_results: List[Dict], google_results: List[Dict]):
    """
    Build a compact list message when a plain search term matched multiple apps.
    Returns (text, numbered_map) where numbered_map maps "1", "2", ... to
    ("apple", track_id) or ("google", package_name) tuples.
    """
    if not apple_results and not google_results:
        text = (
            f"I couldn't find any app matching \"{term}\".\n"
            "Try a different name, or paste a direct App Store / Google Play link."
        )
        return text, {}

    lines = [f"🔍 Results for \"{term}\":\n"]
    index = 1
    numbered_map = {}

    if apple_results:
        lines.append("🍎 App Store:")
        for r in apple_results:
            lines.append(f"{index}. {r['name']} — {r.get('developer', '')}")
            numbered_map[str(index)] = ("apple", r.get("track_id"))
            index += 1
        lines.append("")

    if google_results:
        lines.append("🤖 Google Play:")
        for r in google_results:
            lines.append(f"{index}. {r['name']} — {r.get('developer', '')}")
            numbered_map[str(index)] = ("google", r.get("package_name"))
            index += 1

    lines.append("\nReply with a number to see full details.")
    return "\n".join(lines), numbered_map


def format_error(message: str) -> str:
    return f"⚠️ {message}"


def format_welcome() -> str:
    return (
        "👋 Hi! I'm AppInfoBot.\n\n"
        "Send me:\n"
        "• An app name (e.g. \"Spotify\")\n"
        "• An App Store link\n"
        "• A Google Play link\n\n"
        "…and I'll pull up detailed information about it."
    )


def format_help() -> str:
    return (
        "ℹ️ How to use me:\n\n"
        "1️⃣ Send an app name — I'll search both stores.\n"
        "2️⃣ Send a store link — I'll fetch that exact app.\n"
        "3️⃣ If I find multiple matches, reply with the number shown.\n\n"
        "Commands:\n"
        "/help — show this message\n"
        "/start — welcome message"
    )
