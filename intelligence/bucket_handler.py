import os
import boto3
from log_handler import LogHandler
from config import AWS_CONFIG

log = LogHandler()

class BucketHandler:
    def __init__(self):
        self.AWS_ACCESS_KEY_ID = AWS_CONFIG["AWS_ACCESS_KEY_ID"]
        self.AWS_SECRET_ACCESS_KEY = AWS_CONFIG["AWS_SECRET_ACCESS_KEY"]
        self.BUCKET_NAME = AWS_CONFIG["BUCKET_NAME"]
        self.AWS_REGION = AWS_CONFIG["AWS_REGION"]

        log.info(f"Connecting to bucket: {self.BUCKET_NAME} in region {self.AWS_REGION}")

        if not all([self.AWS_ACCESS_KEY_ID, self.AWS_SECRET_ACCESS_KEY, self.BUCKET_NAME]):
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

    def get_object(self, prefix, local_dir):
        if not self.s3_client:
            log.error("S3 client not initialized.")
            return None

        os.makedirs(local_dir, exist_ok=True)
        is_dir = prefix.endswith('/')

        try:
            if not is_dir:
                # Try direct file download
                local_file_path = os.path.join(local_dir, os.path.basename(prefix))

                try:
                    if os.path.exists(local_file_path):
                        os.remove(local_file_path)

                    log.info(f"Downloading file s3://{self.BUCKET_NAME}/{prefix} to {local_file_path}")
                    self.s3_client.download_file(self.BUCKET_NAME, prefix, local_file_path)
                    return local_file_path

                except self.s3_client.exceptions.NoSuchKey:
                    log.info(f"File not found directly: {prefix}, falling back to prefix-based download")
                except Exception as e:
                    if "Not Found" in str(e):
                        log.info(f"Prefix not found as file, trying as folder")
                    else:
                        log.error(f"Download error: {e}")
                        return None

            # Directory download
            downloaded_files = []
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(Bucket=self.BUCKET_NAME, Prefix=prefix)

            for page in pages:
                for obj in page.get('Contents', []):
                    s3_key = obj['Key']
                    if s3_key.endswith('/'):
                        continue  # Skip S3 "directory markers"

                    relative_path = s3_key[len(prefix):] if is_dir else s3_key
                    local_file_path = os.path.join(local_dir, relative_path)
                    os.makedirs(os.path.dirname(local_file_path), exist_ok=True)

                    if os.path.exists(local_file_path):
                        os.remove(local_file_path)

                    log.info(f"Downloading s3://{self.BUCKET_NAME}/{s3_key} to {local_file_path}")
                    self.s3_client.download_file(self.BUCKET_NAME, s3_key, local_file_path)
                    downloaded_files.append(local_file_path)

            if downloaded_files:
                return local_dir if len(downloaded_files) > 1 else downloaded_files[0]
            else:
                log.warning(f"No files found for prefix: {prefix}")
                return None

        except Exception as e:
            log.error(f"Error downloading from prefix '{prefix}': {e}")
            return None
