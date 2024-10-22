from django.urls import include, re_path
from django.contrib import admin
from django.contrib.auth.views import LoginView, logout_then_login

urlpatterns = [
    re_path(r'^admin/', admin.site.urls),
    re_path(r'^accounts/login/$', LoginView.as_view(), name="login"),
    re_path(r'^accounts/logout/$', logout_then_login, name="logout"),
    re_path('', include('social_django.urls', namespace="social")),
    re_path(r'^lists/', include('lists.urls', namespace='lists')),
    re_path(r'^', include('lists.urls', namespace='lists')),
]
