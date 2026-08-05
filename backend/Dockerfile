FROM python:3.9-alpine3.18 AS builder
RUN apk add --no-cache postgresql-dev build-base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.9-alpine3.18
RUN apk add --no-cache libpq
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app
EXPOSE 8000
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
