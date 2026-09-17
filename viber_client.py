"""
Wraps the Viber Bot Python SDK (`viberbot`) with our message-handling logic.
Docs: https://developers.viber.com/docs/api/python-bot-api/
"""
from viberbot import Api
from viberbot.api.bot_configuration import BotConfiguration
from viberbot.api.messages import TextMessage, PictureMessage
from viberbot.api.viber_requests import (
    ViberMessageRequest,
    ViberSubscribedRequest,
    ViberConversationStartedRequest,
    ViberFailedRequest,
    ViberUnsubscribedRequest,
)

from config import Config
from logger import log
from cache import user_session_cache
from app_lookup.service import resolve, resolve_choice
from app_lookup.formatter import format_welcome, format_help

bot_configuration = BotConfiguration(
    name=Config.BOT_NAME,
    avatar=Config.BOT_AVATAR,
    auth_token=Config.VIBER_AUTH_TOKEN,
)
viber = Api(bot_configuration)


def _send_result(user_id: str, result) -> None:
    """Send a LookupResult back to the user, using a picture message when an icon is available."""
    messages = []
    if result.kind == "detail" and result.icon_url:
        try:
            messages.append(PictureMessage(media=result.icon_url, text=result.text))
        except Exception as exc:
            # Fall back to plain text if the icon URL is somehow invalid for Viber.
            log.warning("Could not attach icon image (%s); sending text only.", exc)
            messages.append(TextMessage(text=result.text))
    else:
        messages.append(TextMessage(text=result.text))

    viber.send_messages(user_id, messages)


def handle_message(viber_request: ViberMessageRequest) -> None:
    user_id = viber_request.sender.id
    message = viber_request.message

    if not isinstance(message, TextMessage):
        viber.send_messages(user_id, [
            TextMessage(text="I can only understand text right now — try sending an app name!")
        ])
        return

    text = (message.text or "").strip()
    log.info("Message from %s: %r", user_id, text)

    if text.lower() in ("/start", "start", "hi", "hello"):
        viber.send_messages(user_id, [TextMessage(text=format_welcome())])
        return

    if text.lower() in ("/help", "help"):
        viber.send_messages(user_id, [TextMessage(text=format_help())])
        return

    # If the user sent a bare number, check whether they're picking from a
    # previous list of search results.
    if text.isdigit():
        pending = user_session_cache.get(user_id)
        if pending and text in pending:
            store, identifier = pending[text]
            if not identifier:
                viber.send_messages(user_id, [
                    TextMessage(text="Sorry, I lost track of that option — please search again.")
                ])
                return
            result = resolve_choice(store, identifier)
            _send_result(user_id, result)
            return
        # A bare number with no pending list — treat it as a literal search term.

    result = resolve(text)

    if result.kind == "choices":
        user_session_cache.set(user_id, result.choices)

    _send_result(user_id, result)


def handle_subscribed(viber_request: ViberSubscribedRequest) -> None:
    user_id = viber_request.user.id
    log.info("User subscribed: %s", user_id)
    viber.send_messages(user_id, [TextMessage(text=format_welcome())])


def handle_conversation_started(viber_request: ViberConversationStartedRequest) -> None:
    """Called when a user opens the chat for the first time (before subscribing)."""
    log.info("Conversation started: %s", viber_request.user.id)
    viber.send_messages(viber_request.user.id, [TextMessage(text=format_welcome())])


def handle_unsubscribed(viber_request: ViberUnsubscribedRequest) -> None:
    log.info("User unsubscribed: %s", viber_request.user_id)


def handle_failed(viber_request: ViberFailedRequest) -> None:
    log.warning("Client failed receiving message: %s | desc=%s",
                viber_request.receiver, viber_request.desc)


def dispatch(viber_request) -> None:
    """Routes a parsed Viber request to the right handler. All handlers send
    any reply themselves via the API, so this never needs a return value."""
    if isinstance(viber_request, ViberMessageRequest):
        handle_message(viber_request)
    elif isinstance(viber_request, ViberSubscribedRequest):
        handle_subscribed(viber_request)
    elif isinstance(viber_request, ViberConversationStartedRequest):
        handle_conversation_started(viber_request)
    elif isinstance(viber_request, ViberUnsubscribedRequest):
        handle_unsubscribed(viber_request)
    elif isinstance(viber_request, ViberFailedRequest):
        handle_failed(viber_request)
    else:
        log.info("Unhandled Viber request type: %s", type(viber_request))
