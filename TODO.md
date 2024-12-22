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
* social auth
    * should be able to do this via df-rest-auth, so should be able to remove social-auth-app-django
* CI
    * mypy

## Frontend
* Search within list - show matching categories or categories with matching items
* UUID or similar for URLs
* when on lists page with an error, remove it from query string so refresh doesn't re-show the error
* update loader update routines to just accept new objects and pass to API
* Nicer styles
    * Modal windows - can these be combined somehow?
        * Get rid of them entirely for list / column and just edit in place?
    * Update / reordering
    *   Update snackbar to allow brief transient success message
    *   https://mui.com/material-ui/transitions/
    * Categories
        * Highlight to edit is too wide
    * Combine all create modals and all update modals, or all into a single type 
    * delete via "drop here to delete"
* make sure all errors from APIs are handled
    * handle API errors with a specific key other than "non_field_errors", such as adding list with bad category
    * pass error key to loader function?
* Auto-update / live-sync via e.g. web sockets?
* consider using e.g. React Query to handle API calls
    * https://tanstack.com/query/latest/docs/framework/react/overview

## Dev Infrastructure
* Address warnings on DB container startup

## Production Release
* Ensure values in wsgi.py / manage.py / production settings / etc. are set appropriately
* Can we remove files such as Procfile, runtime.txt?

# Notes
* [Container Setup](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
* [Dev Containers](https://code.visualstudio.com/docs/devcontainers/create-dev-container#_use-docker-compose)
* [Docker Compose Overview](https://docs.docker.com/compose/)