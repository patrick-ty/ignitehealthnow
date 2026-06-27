FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 \
    POETRY_VERSION=1.8.3 POETRY_VIRTUALENVS_CREATE=false
WORKDIR /app
RUN pip install "poetry==${POETRY_VERSION}"
COPY pyproject.toml poetry.lock ./
RUN poetry install --only main --no-root --no-interaction
COPY app ./app
# Cloud Run injects $PORT (8080). /docs is disabled when ENVIRONMENT=prod.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
