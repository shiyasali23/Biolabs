# Stage 1: Builder with build tools
FROM python:3.9-slim AS builder

WORKDIR /app
COPY requirements.txt .

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Slim runtime
FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /usr/local
COPY model/ ./model/
COPY *.py ./

RUN find /usr/local -type d -name '__pycache__' -exec rm -rf {} + \
    && find /usr/local -name '*.so' -exec strip {} \;

# Security: run as non-root
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8002
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
