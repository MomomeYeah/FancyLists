# TODO

## Backend

### Functionality
* Social auth?
    * Should be able to do this via df-rest-auth, so should be able to remove social-auth-app-django

### CI Enhancements
* mypy

### Additional Fields
* Lists
    * "shared with"
    * images
    * background color / image?
* Items
    * comments
    * description
    * start / due dates
    * owner / members?

## Frontend

### Functionality
* Search within list - show matching categories or categories with matching items
* UUID or similar for URLs
* Make sure all errors from APIs are handled
    * Handle API errors with a specific key other than "non_field_errors", such as adding list with bad category
    * Pass error key to loader function?
* Consider using e.g. React Query to handle API calls
    * https://tanstack.com/query/latest/docs/framework/react/overview
* Auto-update / live-sync via e.g. web sockets?

### UI Enhancements
* Consider tweaking e.g. .category-container:hover style, as it makes item reordering look jumpy
* When reordering lists, drag overlay is offset downwards
* When on lists page with an error, remove it from query string so refresh doesn't re-show the error
* Update loader update routines to just accept new objects and pass to API
* Modal windows - can these be combined somehow?
    * Get rid of them entirely for list / column and just edit in place?
    * Combine all create modals and all update modals, or all into a single type?
* Update / reordering
    * Update snackbar to allow brief transient success message
    * https://mui.com/material-ui/transitions/
* Delete via "drop here to delete"?
* Nicer styles for login screen
* Styles via MUI, e.g. CSSBaseLine

### Performance
* Drag and drop is laggy when moving items between categories and when picking up items / categories
    * This was improved significantly by using memoised items / categories, leaving just brief lag when dragging between categories
    * The DND-Kit demo has flawless performance, but experienced the same lag when I integrated into my project
    * Ideas
        * Was unable to resolve performance issues by replicating any of the techniques from the DND-Kit demo
        * At the end, can we combine SortableItem and SortableContainer, and just setout {children}?
        * Use a single create / update modal for items, resetting the "key" prop when needed

## Dev Infrastructure
* Address warnings on DB container startup

## Production Release
* Ensure values in wsgi.py / manage.py / production settings / etc. are set appropriately
* Can we remove files such as Procfile, runtime.txt?

# Notes
* [DND-Kit Demo](https://5fc05e08a4a65d0021ae0bf2-xkdjvdfnuz.chromatic.com/?path=/story/presets-sortable-multiple-containers--many-items)
* [DND-Kit Demo Code](https://github.com/clauderic/dnd-kit/blob/master/stories/2%20-%20Presets/Sortable/MultipleContainers.tsx)
* [Container Setup](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
* [Dev Containers](https://code.visualstudio.com/docs/devcontainers/create-dev-container#_use-docker-compose)
* [Docker Compose Overview](https://docs.docker.com/compose/)