import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app_lookup.formatter import format_app_details, format_search_results, _human_size, _star_bar


def test_human_size():
    assert _human_size(None) == "N/A"
    assert _human_size(1024) == "1.0 KB"
    assert _human_size(1024 * 1024) == "1.0 MB"


def test_star_bar():
    assert _star_bar(None) == "No ratings yet"
    assert "⭐" in _star_bar(4.6)


def test_format_app_details_minimal():
    info = {"store": "App Store", "name": "Spotify", "rating": 4.7}
    text = format_app_details(info)
    assert "Spotify" in text
    assert "App Store" in text


def test_format_search_results_multiple():
    apple = [{"name": "Spotify", "developer": "Spotify AB", "track_id": "111"}]
    google = [{"name": "Spotify: Music", "developer": "Spotify AB", "package_name": "com.spotify.music"}]
    text, mapping = format_search_results("spotify", apple, google)
    assert "1." in text and "2." in text
    assert mapping["1"] == ("apple", "111")
    assert mapping["2"] == ("google", "com.spotify.music")


def test_format_search_results_none():
    text, mapping = format_search_results("zzzznotarealapp", [], [])
    assert "couldn't find" in text
    assert mapping == {}
