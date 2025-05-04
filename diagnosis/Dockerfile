# Stage 1: Builder with dependencies
FROM python:3.9-slim-buster AS builder

WORKDIR /app
COPY requirements.txt .

# Install build dependencies only for compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies in the global location
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Slim production image
FROM python:3.9-slim-buster

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /usr/local /usr/local
COPY --from=builder /app/requirements.txt .

# Copy application source files
COPY main.py management.py responses.py ./
COPY models/ ./models/

# Install only necessary runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Remove unnecessary files and caches to reduce image size
RUN find /usr/local -depth \
    \( \
        \( -type d -a \( -name test -o -name tests \) \) \
        -o \
        \( -type f -a \( -name '*.pyc' -o -name '*.pyo' -o -name '*.egg-info' -o -name '*.dist-info' \) \) \
    \) -exec rm -rf '{}' + \
    && rm -rf /root/.cache /usr/share/man /usr/share/doc /var/cache/apt/*

# Security: Create a non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
