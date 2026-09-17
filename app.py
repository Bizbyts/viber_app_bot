"""
Flask app exposing the /webhook endpoint that Viber calls.

Run locally with:  python app.py
Run in production with a WSGI server, e.g.:
    gunicorn -w 2 -b 0.0.0.0:$PORT app:flask_app
"""
from flask import Flask, request, Response
from viberbot.api.viber_requests import create_request

from config import Config
from logger import log
import viber_client

Config.validate()

flask_app = Flask(__name__)


@flask_app.route("/", methods=["GET"])
def index():
    return "Viber App Info Bot is running.", 200


@flask_app.route("/healthz", methods=["GET"])
def healthz():
    return {"status": "ok"}, 200


@flask_app.route("/webhook", methods=["POST"])
def incoming():
    # 1. Verify the request really came from Viber using the signature headers.
    signature = request.headers.get("X-Viber-Content-Signature")
    body = request.get_data()

    if not viber_client.viber.verify_signature(body, signature):
        log.warning("Rejected webhook call with invalid signature.")
        return Response(status=403)

    # 2. Parse the payload into a typed ViberRequest object.
    try:
        viber_request = create_request(request.json)
    except Exception as exc:
        log.error("Failed to parse Viber request: %s", exc)
        return Response(status=400)

    # 3. Dispatch to the appropriate handler. Handlers send any reply
    #    themselves via the Viber API, so we just need to ack the webhook.
    try:
        viber_client.dispatch(viber_request)
    except Exception:
        log.exception("Unhandled error while processing a Viber event.")

    return Response(status=200)  # Always 200 so Viber doesn't retry the event.


if __name__ == "__main__":
    log.info("Setting Viber webhook to: %s", Config.WEBHOOK_URL)
    if Config.WEBHOOK_URL:
        try:
            viber_client.viber.set_webhook(Config.WEBHOOK_URL)
        except Exception as exc:
            log.error(
                "Could not set webhook automatically (%s). "
                "You can run set_webhook.py separately once your server is reachable.",
                exc,
            )
    else:
        log.warning("WEBHOOK_URL is not set — skipping automatic webhook registration.")

    flask_app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
