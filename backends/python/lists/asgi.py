"""
ASGI config for FancyLists project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/dev/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

if os.environ.get("DEPLOY_ENVIRONMENT") == "production":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.production")
else:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.local")

application = get_asgi_application()
