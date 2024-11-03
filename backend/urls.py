from django.urls import include, re_path
from django.contrib import admin

urlpatterns = [
    # Django admin site
    re_path(r'^admin/', admin.site.urls),
    re_path('', include('social_django.urls', namespace="social")),
    # URLs for FancyLists
    re_path(r'^api/', include('lists.urls', namespace='api')),
    # add login / logout to the browseable API
    re_path(r'api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # API auth
    re_path(r'auth/', include('dj_rest_auth.urls'))
]
