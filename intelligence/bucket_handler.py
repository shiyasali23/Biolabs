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
        """
        Downloads objects from S3 with the given prefix to the local directory.
        Returns the local path where the file was downloaded.
        Will overwrite existing files with the same name.
        
        Args:
            prefix (str): The S3 key prefix to download
            local_dir (str): The local directory to download to
            
        Returns:
            str: Path to the downloaded file or None if failed
        """
        if not self.s3_client:
            log.error("S3 client not initialized.")
            return None

        # Create the directory if it doesn't exist
        os.makedirs(local_dir, exist_ok=True)
        
        try:
            # First try direct file download
            if not prefix.endswith('/'):
                local_file_path = os.path.join(local_dir, os.path.basename(prefix))
                
                try:
                    log.info(f"Downloading s3://{self.BUCKET_NAME}/{prefix} to {local_file_path}")
                    
                    # Delete the file if it already exists to ensure clean download
                    if os.path.exists(local_file_path):
                        log.info(f"Removing existing file at {local_file_path}")
                        os.remove(local_file_path)
                        
                    self.s3_client.download_file(self.BUCKET_NAME, prefix, local_file_path)
                    log.info(f"Successfully downloaded {prefix} to {local_file_path}")
                    return local_file_path
                    
                except self.s3_client.exceptions.NoSuchKey:
                    log.info(f"No direct file found at {prefix}, trying as prefix")
                    # Fall through to prefix-based download
                except Exception as e:
                    if "Not Found" in str(e):
                        log.info(f"File not found at {prefix}, trying as prefix")
                        # Fall through to prefix-based download
                    else:
                        log.error(f"Error downloading file {prefix}: {e}")
                        return None
            
            # Handle as directory prefix
            downloaded_files = []
            paginator = self.s3_client.get_paginator('list_objects_v2')
            
            try:
                pages = paginator.paginate(Bucket=self.BUCKET_NAME, Prefix=prefix)
                
                for page in pages:
                    if 'Contents' not in page:
                        continue
                        
                    for obj in page.get('Contents', []):
                        s3_key = obj['Key']
                        
                        # Skip directory markers
                        if s3_key.endswith('/'):
                            continue
                            
                        # Determine local path based on prefix style
                        if prefix.endswith('/'):
                            # For directory prefixes, maintain structure
                            relative_path = s3_key[len(prefix):]
                            local_file_path = os.path.join(local_dir, relative_path)
                        else:
                            # For non-directory prefixes (e.g. partial prefixes)
                            # Preserve the full structure - this is the key change
                            relative_path = s3_key
                            # Get just the filename part
                            if '/' in s3_key:
                                # Extract the part after the last '/'
                                base_name = os.path.basename(s3_key)
                                # Extract the directory part without the prefix
                                if s3_key.startswith(prefix):
                                    dir_part = os.path.dirname(s3_key[len(prefix):])
                                    if dir_part:
                                        local_file_path = os.path.join(local_dir, dir_part, base_name)
                                    else:
                                        local_file_path = os.path.join(local_dir, base_name)
                                else:
                                    local_file_path = os.path.join(local_dir, base_name)
                            else:
                                local_file_path = os.path.join(local_dir, s3_key)
                        
                        # Create parent directories if needed
                        os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
                        
                        # Download the file, overwriting if exists
                        if os.path.exists(local_file_path):
                            log.info(f"Overwriting existing file: {local_file_path}")
                            os.remove(local_file_path)
                            
                        log.info(f"Downloading s3://{self.BUCKET_NAME}/{s3_key} to {local_file_path}")
                        self.s3_client.download_file(self.BUCKET_NAME, s3_key, local_file_path)
                        downloaded_files.append(local_file_path)
                
                # Return results
                if len(downloaded_files) == 1:
                    log.info(f"Downloaded 1 file: {downloaded_files[0]}")
                    return downloaded_files[0]
                elif len(downloaded_files) > 1:
                    log.info(f"Downloaded {len(downloaded_files)} files to {local_dir}")
                    # Return directory path for multiple files
                    return local_dir
                else:
                    log.warning(f"No files found matching prefix: {prefix}")
                    return None
            
            except Exception as e:
                log.error(f"Error listing objects with prefix {prefix}: {e}")
                return None
                
        except Exception as e:
            log.error(f"Failed to download from prefix '{prefix}': {e}")
            return None