"""
WSGI config for FancyLists project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/dev/howto/deployment/wsgi/
"""

from django.core.wsgi import get_wsgi_application
import os

if os.environ.get('DEPLOY_ENVIRONMENT') == 'production':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.production")
    application = get_wsgi_application()
else:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.local")
    application = get_wsgi_application()
