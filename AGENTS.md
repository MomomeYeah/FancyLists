# Agent instructions

FancyLists is a React frontend (`frontend/`) with interchangeable REST backends under
`backends/`, one per language:

- `backends/python/` - Django REST backend (the reference implementation)
- `backends/go/` - Go backend (not started)
- `backends/rust/` - Rust backend (not started)

Each backend is a self-contained project: its manifest, lockfile, toolchain config and
environment live in its own directory, and its commands are run from there. See the
`AGENTS.md` in each backend directory for its commands.

Shared at the repo root: `docker-compose.yml` (Postgres, used by every backend), `.env`
(database credentials and secrets), the pre-commit config and the CI workflows in
`.github/workflows/` (one per backend, filtered to that backend's paths).
