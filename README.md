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
FRONTEND_PORT=<Port number for UI>

SECRET_KEY=<Django secret key - django.core.management.utils.get_random_secret_key()>
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=<***-***.apps.googleusercontent.com>
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=<Your Google OAuth secret>
```

* Google OAuth Key and Secret can be generated / retrieved from https://console.cloud.google.com/apis/dashboard
* Build containers via `docker compose --profile full up -d`
* Build just the database via `docker compose up -d`
* access the frontend at `http://localhost:<FRONTEND_PORT>`
* access the backend at `http://localhost:8000/api/` and `http://localhost:8000/admin/`
* access the database via e.g. Docker Desktop, `psql -U <POSTGRES_USER>`

## Troubleshooting

- Ensure line endings on `/backend/entrypoint/sh` are set to `LF`, not `CRLF`