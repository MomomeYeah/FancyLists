# TODO

## Backend
* Lists
    * "shared with"
    * images
    * background color / image?
* Items
    * comments
    * description
    * start / due dates
    * owner / members?
* reordering
    * allow items to be moved to categories within the same list
* social auth
    * should be able to do this via df-rest-auth, so should be able to remove social-auth-app-django
* CI
    * mypy

## Frontend
* Auto-update / live-sync via e.g. web sockets?
* Search within list - show matching categories or categories with matching items
* UUID or similar for URLs
* Nicer styles
    * Modal windows - can these be combined somehow?
    * Categories
* CSRF tokens
* make sure all errors from APIs are handled
    * handle API errors with a specific key other than "non_field_errors", such as adding list with bad category
    * pass error key to loader function?
* consider using e.g. React Query to handle API calls
    * https://tanstack.com/query/latest/docs/framework/react/overview
* do not refresh page when not necessary, e.g. just remove items from DOM on successful delete
    * https://mui.com/material-ui/transitions/
    * only redirect to "/" on e.g. permission violations
    * update snackbar to allow brief transient success message
    * re-order lists in place and revert if update fails
* when on lists page with an error, remove it from query string so refresh doesn't re-show the error

## Dev Infrastructure
* Address warnings on DB container startup

## Production Release
* Ensure values in wsgi.py / manage.py / production settings / etc. are set appropriately
* Can we remove files such as Procfile, runtime.txt?

# Notes
* [Container Setup](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
* [Dev Containers](https://code.visualstudio.com/docs/devcontainers/create-dev-container#_use-docker-compose)
* [Docker Compose Overview](https://docs.docker.com/compose/)