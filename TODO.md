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
* authentication - DRF auth? Ensure some kind of user token is provided to API calls from frontend?
    * presumably we can remove social-auth-app-django
    * user actual logged-in user for list create
    * very request user when adding / editing / deleting lists, categories, and items (DRF permissions)
* provide a method of creating a user
    * DRF create Token
        * https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication
        * https://stackoverflow.com/questions/34114427/django-upgrading-to-1-9-error-appregistrynotready-apps-arent-loaded-yet

## Frontend
* Auto-update / live-sync via e.g. web sockets?
* Save user settings, i.e. which categories are expanded/collapsed, which list was last being edited, etc.
* Search within list - show matching categories or categories with matching items
* uuid or similar for URLs
* update UI on add / delete / edit / etc.
* nicer styles for add X modals

## Dev Infrastructure
* Address warnings on DB container startup

## Production Release
* Ensure values in wsgi.py / manage.py / production settings / etc. are set appropriately
* Can we remove files such as Procfile, runtime.txt?

# Notes
* [Container Setup](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
* [Dev Containers](https://code.visualstudio.com/docs/devcontainers/create-dev-container#_use-docker-compose)
* [Docker Compose Overview](https://docs.docker.com/compose/)