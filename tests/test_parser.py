import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from app_lookup.parser import parse_user_input, QueryType


def test_plain_search_term():
    q = parse_user_input("spotify")
    assert q.query_type == QueryType.SEARCH_TERM
    assert q.value == "spotify"


def test_apple_url_with_path_id():
    url = "https://apps.apple.com/us/app/spotify-music-and-podcasts/id324684580"
    q = parse_user_input(url)
    assert q.query_type == QueryType.APPLE_URL
    assert q.value == "324684580"


def test_apple_url_legacy_itunes_host():
    url = "https://itunes.apple.com/us/app/spotify/id324684580?mt=8"
    q = parse_user_input(url)
    assert q.query_type == QueryType.APPLE_URL
    assert q.value == "324684580"


def test_apple_url_missing_id_raises():
    with pytest.raises(ValueError):
        parse_user_input("https://apps.apple.com/us/app/spotify/")


def test_google_play_url():
    url = "https://play.google.com/store/apps/details?id=com.spotify.music&hl=en"
    q = parse_user_input(url)
    assert q.query_type == QueryType.GOOGLE_URL
    assert q.value == "com.spotify.music"


def test_google_play_url_missing_id_raises():
    with pytest.raises(ValueError):
        parse_user_input("https://play.google.com/store/apps/")


def test_unrecognized_url_raises():
    with pytest.raises(ValueError):
        parse_user_input("https://example.com/some/app")


def test_empty_input_raises():
    with pytest.raises(ValueError):
        parse_user_input("   ")
