import logging
from config import LOG_CONFIG

class LogHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_once()
        return cls._instance

    def _init_once(self):
        self.logger = logging.getLogger("app")
        self.logger.setLevel(LOG_CONFIG.get("LOG_LEVEL", "INFO"))
        if self.logger.hasHandlers():
            self.logger.handlers.clear()
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))
        self.logger.addHandler(console_handler)

    def _log(self, level, message):
        log_method = getattr(self.logger, level.lower())
        log_method(message)

    def error(self, message):
        self._log("ERROR", message)

    def info(self, message):
        self._log("INFO", message)

    def message(self, message):
        self._log("INFO", message)

    def critical_error(self, message):
        self._log("CRITICAL", message)