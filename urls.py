from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.auth.views import login, logout_then_login

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/login/$',  login, name="login"),
    url(r'^accounts/logout/$', logout_then_login, name="logout"),
    url('', include('social_django.urls', namespace='social')),
    url(r'^lists/', include('lists.urls', namespace = 'lists')),
    url(r'^', include('lists.urls', namespace = 'lists')),
]
