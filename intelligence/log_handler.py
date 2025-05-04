import logging

# Configure logging - simplified format to reduce prefix
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger("app")

class LogHandler:
    def __init__(self):
        pass
    
    def _handle_log(self, message, is_error=False):
        if is_error:
            logger.error(message)
        else:
            logger.info(message)
            
    def log_error(self, message):
        return self._handle_log(message, is_error=True)
    
    def log_info(self, message):
        return self._handle_log(message)
    
    def log_message(self, message):
        return self._handle_log(message)
    
    def handle_critical_error(self, message):
        return self._handle_log(message, is_error=True)
        
    def error(self, message):
        """Alias for log_error for compatibility"""
        return self.log_error(message)