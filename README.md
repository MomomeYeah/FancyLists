FancyLists
==========

This project is a great idea I had about being able to share shopping lists with my wife. I was super excited about it until I realised I'd basically just re-invented Trello.

## Development Setup

* Create a file in the project root directory named `.env`, and populate it with the following:

```
POSTGRES_PASSWORD=<POSTGRES_PASSWORD>
POSTGRES_USER=<POSTGRES_USER>
POSTGRES_DB=<POSTGRES_DB>

DEBUG=<True|False>

SECRET_KEY=<Django secret key - django.core.management.utils.get_random_secret_key()>
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=<***-***.apps.googleusercontent.com>
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=<Your Google OAuth secret>
```

* Google OAuth Key and Secret can be generated / retrieved from https://console.cloud.google.com/apis/dashboard

### Running the backend locally

The backend is managed with [uv](https://docs.astral.sh/uv/). From the repo root:

* `uv sync` to create `.venv` and install dependencies
* `docker compose up -d` to start just the database
* `uv run poe migrate` then `uv run poe serve` to run the API on `http://localhost:8000`
* Access the backend at `http://localhost:8000/api/` and `http://localhost:8000/admin/`

### Running the frontend locally

From the `frontend/` directory:

* `npm start`
* Access the UI at `http://localhost:3000`

### Checks

* `uv run poe check` runs Ruff lint, Ruff format check, ty and pytest - the same as CI
* `uv run poe static` runs everything except the tests (no database needed)
* `uv run poe fix` applies Ruff autofixes and formatting
* `uv run pre-commit install` installs the git hooks
* `uv run poe` lists all tasks

In VS Code, install the recommended extensions (Ruff, ty) and select `.venv` as the interpreter. They use the same tool versions and config as the commands above.

## Troubleshooting

* Ensure line endings on `/backend/entrypoint/sh` are set to `LF`, not `CRLF`
* Clear all Docker artifacts via `docker compose down -v --rmi all --remove-orphans`
* Access the database via e.g. Docker Desktop, `psql -U <POSTGRES_USER>`