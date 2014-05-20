from django.conf.urls import patterns, include, url

from lists import views

urlpatterns = patterns('',
    url(r'^$', views.base, name = 'base')
)
