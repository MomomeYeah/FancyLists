from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import URLPattern, URLResolver, include, re_path

urlpatterns: list[URLPattern | URLResolver] = [
    # Django admin site
    re_path(r"^admin/", admin.site.urls),
    re_path("", include("social_django.urls", namespace="social")),
    # URLs for FancyLists
    re_path(r"^api/", include("lists.urls", namespace="api")),
    # add login / logout to the browseable API
    re_path(r"api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    # API auth
    re_path(r"auth/", include("dj_rest_auth.urls")),
    re_path(r"auth/registration/", include("dj_rest_auth.registration.urls")),
]

# Serve static files (admin, browsable API) in development; empty unless DEBUG.
# runserver did this automatically, uvicorn does not.
urlpatterns += staticfiles_urlpatterns()
