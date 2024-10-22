# TODO

## Backend
* Rework + simplify data model - categories belong to a single task, items to a single category
* Remove templated frontend entirely, replaced with API
* Provide swagger viewer?

## Frontend
* Auto-update / live-sync via e.g. web sockets
* React + MUI for UI
* Save user settings, i.e. which categories are expanded/collapsed, which list was last being edited, etc.

## Dev Infrastructure
* Address warnings on DB container startup

## Production Release
* Ensure values in wsgi.py / manage.py / production settings / etc. are set appropriately

# Notes
* [Container Setup](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
* [Dev Containers](https://code.visualstudio.com/docs/devcontainers/create-dev-container#_use-docker-compose)
* [Docker Compose Overview](https://docs.docker.com/compose/)