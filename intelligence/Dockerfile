# Stage 1: Builder with dependencies
FROM python:3.9-slim-bullseye AS builder

WORKDIR /app
COPY requirements.txt .

# Install build dependencies only for compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Slim production image
FROM python:3.9-slim-bullseye

WORKDIR /app

# Copy installed dependencies
COPY --from=builder /usr/local /usr/local
COPY requirements.txt ./

# Copy application source files
COPY . .

# Install runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Cleanup caches and tests
RUN find /usr/local -depth \
    \( \
        \( -type d -a \( -name test -o -name tests \) \) \
        -o \
        \( -type f -a \( -name '*.pyc' -o -name '*.pyo' -o -name '*.egg-info' -o -name '*.dist-info' \) \) \
    \) -exec rm -rf '{}' + \
    && rm -rf /root/.cache /usr/share/man /usr/share/doc /var/cache/apt/*

# Run as non-root
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8003
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]