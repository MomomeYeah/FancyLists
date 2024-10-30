FancyLists
==========

This project is a great idea I had about being able to share shopping lists with my wife. I was super excited about it until I realised I'd basically just re-invented Trello.

## Development Setup

* create a file in the project root directory named `.env`, and populate it with the following:

```
POSTGRES_PASSWORD=<POSTGRES_PASSWORD>
POSTGRES_USER=<POSTGRES_USER>
POSTGRES_DB=<POSTGRES_DB>

DEBUG=<True|False>

SECRET_KEY=<Django secret key - django.core.management.utils.get_random_secret_key()>
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=<***-***.apps.googleusercontent.com>
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=<Your Google OAuth secret>
```

* build dev containers
* access the frontend at `localhost:3001`
* access the backend at `localhost:8000`