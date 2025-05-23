import os
import json
import boto3
from typing import Optional

from datetime import datetime
from log_handler import LogHandler
from config import AWS_CONFIG


log = LogHandler()

class BucketHandler:
    def __init__(self):
        self.AWS_ACCESS_KEY_ID = AWS_CONFIG.get("AWS_ACCESS_KEY_ID")
        self.AWS_SECRET_ACCESS_KEY = AWS_CONFIG.get("AWS_SECRET_ACCESS_KEY")
        self.MODEL_BUCKET_NAME = AWS_CONFIG.get("MODEL_BUCKET_NAME")
        self.QUERIES_BUCKET_NAME = AWS_CONFIG.get("QUERIES_BUCKET_NAME")
        self.AWS_REGION = AWS_CONFIG.get("AWS_REGION")

        log.info(f"Connecting to model bucket: {self.MODEL_BUCKET_NAME} in region {self.AWS_REGION}")
        log.info(f"Connecting to queries bucket: {self.QUERIES_BUCKET_NAME} in region {self.AWS_REGION}")

        if not all([self.AWS_ACCESS_KEY_ID, self.AWS_SECRET_ACCESS_KEY,
                    self.MODEL_BUCKET_NAME, self.QUERIES_BUCKET_NAME, self.AWS_REGION]):
            log.error("Missing required AWS configuration.")
            self.s3_client = None
            return

        try:
            self.s3_client = boto3.client(
                "s3",
                region_name=self.AWS_REGION,
                aws_access_key_id=self.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY
            )
        except Exception as e:
            log.error(f"Failed to initialize S3 client: {e}")
            self.s3_client = None

    def get_object(self, prefix: str, local_dir: str) -> Optional[str]:

        """
        Download file or directory from S3.

        Args:
            prefix (str): S3 key or prefix.
            local_dir (str): Local destination directory.

        Returns:
            str | None: Path to downloaded file or directory, or None if failure.
        """
        if not self.s3_client:
            log.error("S3 client not initialized.")
            return None

        os.makedirs(local_dir, exist_ok=True)
        is_dir = prefix.endswith('/')

        try:
            if not is_dir:
                # Attempt to download single file
                local_file_path = os.path.join(local_dir, os.path.basename(prefix))

                if os.path.exists(local_file_path):
                    os.remove(local_file_path)

                log.info(f"Downloading file s3://{self.MODEL_BUCKET_NAME}/{prefix} to {local_file_path}")
                self.s3_client.download_file(self.MODEL_BUCKET_NAME, prefix, local_file_path)
                return local_file_path

        except self.s3_client.exceptions.NoSuchKey:
            log.info(f"File not found: {prefix}, trying prefix-based folder download.")
        except Exception as e:
            if "Not Found" in str(e):
                log.info("Falling back to directory download.")
            else:
                log.error(f"Download error: {e}")
                return None

        # Directory download fallback
        try:
            downloaded_files = []
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(Bucket=self.MODEL_BUCKET_NAME, Prefix=prefix)

            for page in pages:
                for obj in page.get('Contents', []):
                    s3_key = obj['Key']
                    if s3_key.endswith('/'):
                        continue  # Skip empty directory markers

                    relative_path = s3_key[len(prefix):] if is_dir else s3_key
                    local_file_path = os.path.join(local_dir, relative_path)
                    os.makedirs(os.path.dirname(local_file_path), exist_ok=True)

                    if os.path.exists(local_file_path):
                        os.remove(local_file_path)

                    log.info(f"Downloading s3://{self.MODEL_BUCKET_NAME}/{s3_key} to {local_file_path}")
                    self.s3_client.download_file(self.MODEL_BUCKET_NAME, s3_key, local_file_path)
                    downloaded_files.append(local_file_path)

            if downloaded_files:
                return local_dir if len(downloaded_files) > 1 else downloaded_files[0]
            else:
                log.warning(f"No files found for prefix: {prefix}")
                return None

        except Exception as e:
            log.error(f"Error downloading from prefix '{prefix}': {e}")
            return None

    def store_query_data(self, response: str, token: str = None, query: str = None) -> bool:
        """
        Store a user query and system response to the queries bucket.

        Args:
            response (str): System's response to the user query.
            token (str, optional): User token or session ID.
            query (str, optional): User's input query.

        Returns:
            bool: True if upload succeeded, False otherwise.
        """
        if not self.s3_client:
            log.error("S3 client not initialized.")
            return False

        try:
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

            self.s3_client.put_object(
                Bucket=self.QUERIES_BUCKET_NAME,
                Key=s3_key,
                Body=json.dumps(payload, ensure_ascii=False),
                ContentType='application/json'
            )

            log.info(f"Query data stored at s3://{self.QUERIES_BUCKET_NAME}/{s3_key}")
            return True

        except Exception as e:
            log.error(f"Error storing query data: {e}")
            return False
