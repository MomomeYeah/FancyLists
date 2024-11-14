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
* provide a method of creating a user
    * DRF create Token
        * https://dj-rest-auth.readthedocs.io/en/latest/api_endpoints.html
        * https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication
        * https://stackoverflow.com/questions/34114427/django-upgrading-to-1-9-error-appregistrynotready-apps-arent-loaded-yet
        * https://www.django-rest-framework.org/api-guide/permissions/#isauthenticated
* tests
    * permissions
* CI
    * mypy

## Frontend
* Auto-update / live-sync via e.g. web sockets?
* Search within list - show matching categories or categories with matching items
* uuid or similar for URLs
* nicer styles for add X modals
* CSRF tokens
* make sure all errors from APIs are handled
    * handle API errors with a specific key other than "non_field_errors", such as adding list with bad category
* consider using e.g. React Query to handle API calls
    * https://tanstack.com/query/latest/docs/framework/react/overview
* do not refresh page when not necessary, e.g. just remove items from DOM on successful delete
    * https://mui.com/material-ui/transitions/
    * only redirect to "/" on e.g. permission violations
* drag and drop to reorder categories and items
    * https://www.reddit.com/r/reactjs/comments/14w4zrh/which_library_is_good_for_drag_and_drop/?rdt=41280
    * https://github.com/hello-pangea/dnd
    * https://dndkit.com/
    * https://docs.dndkit.com/
    * https://github.com/clauderic/dnd-kit

## Dev Infrastructure
* Address warnings on DB container startup

## Production Release
* Ensure values in wsgi.py / manage.py / production settings / etc. are set appropriately
* Can we remove files such as Procfile, runtime.txt?

# Notes
* [Container Setup](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
* [Dev Containers](https://code.visualstudio.com/docs/devcontainers/create-dev-container#_use-docker-compose)
* [Docker Compose Overview](https://docs.docker.com/compose/)