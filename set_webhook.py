"""
Standalone utility to (re)register or remove the Viber webhook.

Usage:
    python set_webhook.py set                 # uses WEBHOOK_URL from config/.env
    python set_webhook.py set https://foo.com/webhook
    python set_webhook.py unset
"""
import sys
from config import Config
from viber_client import viber
from logger import log


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ("set", "unset"):
        print(__doc__)
        sys.exit(1)

    action = sys.argv[1]

    if action == "unset":
        viber.unset_webhook()
        log.info("Webhook removed.")
        return

    url = sys.argv[2] if len(sys.argv) > 2 else Config.WEBHOOK_URL
    if not url:
        print("No webhook URL provided and WEBHOOK_URL is not set in the environment.")
        sys.exit(1)

    result = viber.set_webhook(url)
    log.info("Webhook set to %s -> response: %s", url, result)


if __name__ == "__main__":
    main()
