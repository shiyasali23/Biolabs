import logging
from config import LOG_CONFIG

# Decorator for storing logs locally
def store_locally(func):
    def wrapper(self, message, *args, **kwargs):
        # First, log to console using the original logging function
        func(self, message, *args, **kwargs)
        
        # If storing logs to a file is enabled, write to the file
        if LOG_CONFIG.get("LOG_TO_FILE", False):
            with open(LOG_CONFIG.get("LOG_FILE", "app.log"), "a") as f:
                f.write(f"{message}\n")
    
    return wrapper

class LogHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_once()
        return cls._instance
    
    def _init_once(self):
        """Initialize the logger with console handler and optional file handler."""
        self.logger = logging.getLogger("app")
        self.logger.setLevel(LOG_CONFIG.get("LOG_LEVEL", "INFO"))
        
        # Clear existing handlers
        if self.logger.hasHandlers():
            self.logger.handlers.clear()
        
        # Console handler for logging to terminal
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))
        self.logger.addHandler(console_handler)
        
        # File handler (if enabled in config)
        if LOG_CONFIG.get("LOG_TO_FILE", False):
            file_handler = logging.FileHandler(LOG_CONFIG.get("LOG_FILE", "app.log"))
            file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
            self.logger.addHandler(file_handler)

    def _log(self, level, message):
        """Log a message with the given level."""
        log_method = getattr(self.logger, level.lower())
        log_method(message)

    def error(self, message):
        self._log("ERROR", message)

    @store_locally
    def info(self, message):
        """Log info message to console and optionally store locally."""
        self._log("INFO", message)
    
    def message(self, message):
        """Log general message (info level) to console."""
        self._log("INFO", message)

    @store_locally
    def critical_error(self, message):
        """Log critical errors to console and optionally store locally."""
        self._log("CRITICAL", message)
