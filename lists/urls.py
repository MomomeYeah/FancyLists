from django.conf.urls import patterns, include, url

from lists import views

urlpatterns = patterns('',
    url(r'^$', views.index, name = 'index'),
    url(r'^categories/new/(\d+)$', views.new_category, name = 'new_category'),
    url(r'^categories/delete/(\d+)$', views.delete_category, name = 'delete_category'),
    url(r'^items/new/(\d+)$', views.new_item, name = 'new_item'),
    url(r'^items/delete/(\d+)$', views.delete_item, name = 'delete_item'),
    url(r'^new/$', views.new_list, name = 'new_list'),
    url(r'^delete/(\d+)$', views.delete_list, name = 'delete_list'),
)
