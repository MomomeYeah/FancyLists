"""Development settings and globals."""

from pathlib import Path

from dotenv import load_dotenv

# Load the repo-root .env before base settings read os.environ. Existing
# environment variables (e.g. those set by docker compose) take precedence.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

from .base import *

CORS_ALLOW_ALL_ORIGINS = True
