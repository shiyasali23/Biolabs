# Stage 1: Builder
FROM python:3.9-alpine3.18 AS builder
RUN apk add --no-cache postgresql-dev build-base

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.9-alpine3.18
RUN apk add --no-cache libpq

WORKDIR /app
COPY --from=builder /root/.local /usr/local
COPY . .

RUN find /usr/local -depth \( -name '*.egg-info' -o -name '*.dist-info' \) -exec rm -rf {} + && \
    find /usr/local -type d -name 'tests' -exec rm -rf {} +

# Security: run as non-root
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 8000
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
