from django.conf.urls import patterns, url

from lists import views

urlpatterns = patterns('',
    url(r'^$', views.index, name = 'index'),
    url(r'^addCategory/(\d+)$', views.index_add_category, name = 'index_add_category'),
    url(r'^removeCategory/(\d+)$', views.index_remove_category, name = 'index_remove_category'),
    url(r'^reorderCategory/(\d+)$', views.index_reorder_category, name = 'index_reorder_category'),
    url(r'^addItem/(\d+)$', views.index_add_item, name = 'index_add_item'),
    url(r'^removeItem/(\d+)$', views.index_remove_item, name = 'index_remove_item'),
    url(r'^reorderItem/(\d+)$', views.index_reorder_item, name = 'index_reorder_item'),
    url(r'^categories/$', views.category_index, name = 'category_index'),
    url(r'^categories/new/$', views.new_category, name = 'new_category'),
    url(r'^categories/delete/(\d+)$', views.delete_category, name = 'delete_category'),
    url(r'^items/$', views.item_index, name = 'item_index'),
    url(r'^items/new/$', views.new_item, name = 'new_item'),
    url(r'^items/delete/(\d+)$', views.delete_item, name = 'delete_item'),
    url(r'^new/$', views.new_list, name = 'new_list'),
    url(r'^delete/(\d+)$', views.delete_list, name = 'delete_list'),
)
