"""Development settings and globals."""

from .base import *

SECRET_KEY = get_secret('SECRET_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = get_secret('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = get_secret('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET')
