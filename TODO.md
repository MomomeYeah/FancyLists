# TODO

## Backend
* Lists "shared with"
* Items
    * comments
    * description
    * start / due dates
    * owner / members?
* authentication - DRF auth? Ensure some kind of user token is provided to API calls from frontend?
    * presumably we can remove social-auth-app-django

## Frontend
* Auto-update / live-sync via e.g. web sockets
* React + MUI for UI
* Save user settings, i.e. which categories are expanded/collapsed, which list was last being edited, etc.

## Dev Infrastructure
* Address warnings on DB container startup

## Production Release
* Ensure values in wsgi.py / manage.py / production settings / etc. are set appropriately
* Can we remove files such as Procfile, runtime.txt?

# Notes
* [Container Setup](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
* [Dev Containers](https://code.visualstudio.com/docs/devcontainers/create-dev-container#_use-docker-compose)
* [Docker Compose Overview](https://docs.docker.com/compose/)