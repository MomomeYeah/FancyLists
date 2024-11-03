from django.urls import path
from lists import views

app_name = "api"

urlpatterns = [
    path("", views.api_root),
    path("lists/",
         views.FancyListList.as_view(),
         name="list-list"),
    path("lists/<int:pk>/",
         views.FancyListDetail.as_view(),
         name="list-detail"),
    path("categories/",
         views.CategoryList.as_view(),
         name="category-list"),
    path(
        "categories/<int:pk>/",
        views.CategoryDetail.as_view(),
        name="category-detail"),
    path("items/",
         views.ItemList.as_view(),
         name="item-list"),
    path("items/<int:pk>/",
         views.ItemDetail.as_view(),
         name="item-detail"),
]
