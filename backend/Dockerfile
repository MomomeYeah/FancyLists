# Built with the repo root as context, so pyproject.toml and uv.lock are available
FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:0.12.5 /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Install dependencies first so code changes don't invalidate this layer
COPY pyproject.toml uv.lock .python-version ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

COPY backend ./backend

WORKDIR /app/backend

EXPOSE 8000

ENTRYPOINT [ "/app/backend/entrypoint.sh" ]
