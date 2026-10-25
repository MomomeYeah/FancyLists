#!/bin/bash
set -e

python manage.py migrate
exec uvicorn lists.asgi:application --host 0.0.0.0 --port 8000 --reload
