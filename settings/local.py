"""Development settings and globals."""

from .base import *

import json

from django.core.exceptions import ImproperlyConfigured

SECRETS_LOC = os.path.join(BASE_DIR, 'settings', 'secrets.json')

with open(SECRETS_LOC) as f:
    secrets = json.loads(f.read())

def get_secret(setting, secrets=secrets):
    """Get the secret variable of return an explicit exception"""
    try:
        return secrets[setting]
    except KeyError:
        error_msg = "Set the {0} property in secrets.json".format(setting)
        raise ImproperlyConfigured(error_msg)

SECRET_KEY = get_secret('SECRET_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = get_secret('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = get_secret('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET')
