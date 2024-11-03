# TODO

## Backend
* API
    * return categories + items in main list response to avoid multiple calls?
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
* authentication
    * use actual logged-in user for list create
    * verify request user when adding / editing / deleting lists, categories, and items (DRF permissions)
* provide a method of creating a user
    * DRF create Token
        * https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication
        * https://stackoverflow.com/questions/34114427/django-upgrading-to-1-9-error-appregistrynotready-apps-arent-loaded-yet
        * https://www.django-rest-framework.org/api-guide/permissions/#isauthenticated

## Frontend
* Auto-update / live-sync via e.g. web sockets?
* Save user settings, i.e. which categories are expanded/collapsed, which list was last being edited, etc.
* Search within list - show matching categories or categories with matching items
* uuid or similar for URLs
* nicer styles for add X modals
* CSRF tokens
* make sure all errors from APIs are handled
* do not refresh page when not necessary, e.g. just remove items from DOM on successful delete
* pull out hard-coded URLs into somewhere more appropriate
* convert loaders into a hook?

## Dev Infrastructure
* Address warnings on DB container startup

## Production Release
* Ensure values in wsgi.py / manage.py / production settings / etc. are set appropriately
* Can we remove files such as Procfile, runtime.txt?

# Notes
* [Container Setup](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
* [Dev Containers](https://code.visualstudio.com/docs/devcontainers/create-dev-container#_use-docker-compose)
* [Docker Compose Overview](https://docs.docker.com/compose/)