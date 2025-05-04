from webapp.serializers import RecordSerializer
from webapp.models import Record

from utils.response_handler import ResponseHandler
from utils.objects_handler import ObjectsHandler

response_handler = ResponseHandler()
objects_handler = ObjectsHandler()

class RecordsHandler:
    
    def validate_record_data(self, record_data):
        try:
            required_fields = ['text', 'file_1', 'file_2']

            if not any(record_data.get(field) for field in required_fields):
                return "At least one of 'text', 'file_1', or 'file_2' must be provided."
            
            return None

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error validating record data: {str(e)}"
            )


    
    def handle_create_record(self, records_data, user):
        try:     
            missing_fields = self.validate_record_data(records_data)
            if missing_fields:
                return response_handler.handle_response(
                    status_code=400,
                    message=missing_fields,
                    error=response_handler.MESSAGES['REQUIRED_FIELDS_MISSING']
                )
            
            records_data['user'] = user.id  
            record_serializer = RecordSerializer(data=records_data)

            if record_serializer.is_valid(): 
                record_serializer.save()
                return response_handler.handle_response(
                    response=record_serializer.data
                )
            
            return response_handler.handle_exception(
                    exception=f"Error saving record: {record_serializer.errors}"
                )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error creating record: {str(e)}"
            )
            
    def handle_get_record(self, user):
        try:
            records, error  = objects_handler.get_all_objects(
                model=Record, 
                serializer_class=RecordSerializer,
                prefetch_related_fields=['user'],
                
            )
            
            if error:
                return response_handler.handle_exception(
                    exception=f"Error getting records: {error}"
                )
            
            return response_handler.handle_response(
                response=records
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error getting records: {str(e)}"
            )
