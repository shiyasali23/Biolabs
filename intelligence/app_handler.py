from log_handler import LogHandler
from database_handler import DatabaseHandler
from responses_handler import ResponseHandler

log_handler = LogHandler()
responses_handler = ResponseHandler()

class AppHandler:
    def __init__(self):        
        log_handler.info("Initializing AppHandler")
        
        self.db_handler = DatabaseHandler()

    async def generate_text(self, query):
        try:
            return await self.db_handler.is_relevant(query)
        except Exception as e:
            return responses_handler.handle_exception(exception=f"Error in generating text: {str(e)}")