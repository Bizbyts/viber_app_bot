"""
Centralized logging configuration.
"""
import logging
import sys
from config import Config


def setup_logging() -> logging.Logger:
    logger = logging.getLogger("viber_app_bot")
    if logger.handlers:
        return logger  # already configured (e.g. re-imported)

    level = getattr(logging, Config.LOG_LEVEL.upper(), logging.INFO)
    logger.setLevel(level)

    fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(fmt)
    logger.addHandler(stream_handler)

    if Config.LOG_FILE:
        file_handler = logging.FileHandler(Config.LOG_FILE)
        file_handler.setFormatter(fmt)
        logger.addHandler(file_handler)

    return logger


log = setup_logging()
