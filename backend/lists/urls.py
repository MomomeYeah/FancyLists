from django.urls import re_path

from lists import views

app_name = "lists"

urlpatterns = [
    re_path(r'^$', views.list_index, name = 'list_index'),
    re_path(r'^new/$', views.new_list, name = 'new_list'),
    re_path(r'^edit/(\d+)$', views.edit_list, name = 'edit_list'),
    re_path(r'^editName/(\d+)$', views.edit_list_name, name = 'edit_list_name'),
    re_path(r'^duplicate/(\d+)$', views.duplicate_list, name = 'duplicate_list'),
    re_path(r'^delete/(\d+)$', views.delete_list, name = 'delete_list'),
    re_path(r'^addCategory/(\d+)$', views.index_add_category, name = 'index_add_category'),
    re_path(r'^removeCategory/(\d+)$', views.index_remove_category, name = 'index_remove_category'),
    re_path(r'^reorderCategory/(\d+)$', views.index_reorder_category, name = 'index_reorder_category'),
    re_path(r'^addItem/(\d+)$', views.index_add_item, name = 'index_add_item'),
    re_path(r'^removeItem/(\d+)$', views.index_remove_item, name = 'index_remove_item'),
    re_path(r'^reorderItem/(\d+)$', views.index_reorder_item, name = 'index_reorder_item'),
    re_path(r'^categories/$', views.category_index, name = 'category_index'),
    re_path(r'^categories/new/$', views.new_category, name = 'new_category'),
    re_path(r'^categories/edit/(\d+)$', views.edit_category, name = 'edit_category'),
    re_path(r'^categories/delete/(\d+)$', views.delete_category, name = 'delete_category'),
    re_path(r'^items/$', views.item_index, name = 'item_index'),
    re_path(r'^items/new/$', views.new_item, name = 'new_item'),
    re_path(r'^items/edit/(\d+)$', views.edit_item, name = 'edit_item'),
    re_path(r'^items/delete/(\d+)$', views.delete_item, name = 'delete_item'),
]
