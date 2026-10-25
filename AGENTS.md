# Agent instructions

FancyLists is a Django REST backend (`backend/`) and a React frontend (`frontend/`).
The Python project (`pyproject.toml`, `uv.lock`, `.venv`) lives at the repo root; run all
commands below from the repo root.

## Backend commands

- `uv sync` - install dependencies
- `uv run poe static` - lint, format check and type check (no database needed)
- `uv run poe test` - run tests (needs Postgres: `docker compose up -d`)
- `uv run poe check` - everything CI runs; must pass before finishing a change
- `uv run poe fix` - apply Ruff autofixes and formatting
- `uv run poe serve` - run the dev server on port 8000

Ruff and ty are configured in `pyproject.toml` and are the same versions the VS Code
extensions use, so anything the editor flags is reported by these commands and vice versa.
Fix reported issues rather than suppressing them; if a suppression is genuinely needed, prefer
a targeted config change in `pyproject.toml` over inline `# noqa` / `# ty: ignore` comments.

Add dependencies with `uv add <pkg>` (or `uv add --dev <pkg>`), never with pip.
