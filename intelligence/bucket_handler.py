import os
import json
import boto3
import asyncio
from typing import Optional
from datetime import datetime
from log_handler import LogHandler
from config import AWS_CONFIG

log = LogHandler()

class BucketHandler:
    def __init__(self):
        self.aws_access_key_id = AWS_CONFIG.get("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = AWS_CONFIG.get("AWS_SECRET_ACCESS_KEY")
        self.model_bucket_name = AWS_CONFIG.get("MODEL_BUCKET_NAME")
        self.queries_bucket_name = AWS_CONFIG.get("QUERIES_BUCKET_NAME")
        self.aws_region = AWS_CONFIG.get("AWS_REGION")

        if not all([self.aws_access_key_id, self.aws_secret_access_key, self.model_bucket_name, self.queries_bucket_name, self.aws_region]):
            self.s3_client = None
            return

        try:
            self.s3_client = boto3.client(
                "s3",
                region_name=self.aws_region,
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key
            )
        except Exception as e:
            log.error(str(e))
            self.s3_client = None

    def get_object(self, prefix: str, local_dir: str) -> Optional[str]:
        if not self.s3_client:
            return None

        os.makedirs(local_dir, exist_ok=True)
        is_dir = prefix.endswith('/')

        try:
            if not is_dir:
                local_file_path = os.path.join(local_dir, os.path.basename(prefix))
                if os.path.exists(local_file_path):
                    os.remove(local_file_path)
                self.s3_client.download_file(self.model_bucket_name, prefix, local_file_path)
                return local_file_path
        except Exception:
            pass

        try:
            downloaded_files = []
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(Bucket=self.model_bucket_name, Prefix=prefix)

            for page in pages:
                for obj in page.get('Contents', []):
                    s3_key = obj['Key']
                    if s3_key.endswith('/'):
                        continue

                    relative_path = s3_key[len(prefix):] if is_dir else s3_key
                    local_file_path = os.path.join(local_dir, relative_path)
                    os.makedirs(os.path.dirname(local_file_path), exist_ok=True)

                    if os.path.exists(local_file_path):
                        os.remove(local_file_path)
                    self.s3_client.download_file(self.model_bucket_name, s3_key, local_file_path)
                    downloaded_files.append(local_file_path)

            if downloaded_files:
                return local_dir if len(downloaded_files) > 1 else downloaded_files[0]
            return None

        except Exception as e:
            log.error(str(e))
            return None

    async def store_query_data(self, response: str, token: str = None, query: str = None) -> bool:
        try:
            if not self.s3_client:
                return False

            now = datetime.utcnow()
            timestamp = now.isoformat()
            year = now.strftime("%Y")
            month = now.strftime("%m")
            day = now.strftime("%d")
            session_token = token[-6:] if token else "anon"
            session_id = f"session_{now.strftime('%Y%m%d%H%M%S')}_{session_token}"
            s3_key = f"year={year}/month={month}/day={day}/{session_id}.json"

            payload = {
                "id": None,
                "token": token,
                "timestamp": timestamp,
                "query": query,
                "response": response
            }

            def _put():
                self.s3_client.put_object(
                    Bucket=self.queries_bucket_name,
                    Key=s3_key,
                    Body=json.dumps(payload, ensure_ascii=False),
                    ContentType='application/json'
                )

            await asyncio.to_thread(_put)
            return True

        except Exception as e:
            log.error(str(e))
            return False