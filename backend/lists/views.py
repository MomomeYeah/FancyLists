from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.reverse import reverse

from lists.models import Category, FancyList, Item
from lists.permissions import CategoryIsOwnedBy, ItemIsOwnedBy, ListIsOwnedBy
from lists.serializers import (
    CategorySerializer,
    FancyListListSerializer,
    FancyListSerializer,
    ItemSerializer,
    UpdateCategorySerializer,
    UpdateItemSerializer,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_root(request, format=None) -> Response:
    return Response(
        {
            "lists": reverse("api:list-list", request=request, format=format),
            "categories": reverse("api:category-list", request=request, format=format),
            "items": reverse("api:item-list", request=request, format=format),
        }
    )


class FancyListList(generics.ListCreateAPIView):
    serializer_class = FancyListListSerializer

    def get_queryset(self):
        user = self.request.user
        return FancyList.objects.filter(owner=user).order_by("display_order")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class FancyListDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FancyList.objects.all()
    serializer_class = FancyListSerializer
    permission_classes = [ListIsOwnedBy]


class CategoryList(generics.ListCreateAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        user = self.request.user
        return Category.objects.filter(list__owner=user).order_by("list__id", "display_order")


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = UpdateCategorySerializer
    permission_classes = [CategoryIsOwnedBy]


class ItemList(generics.ListCreateAPIView):
    serializer_class = ItemSerializer

    def get_queryset(self):
        user = self.request.user
        return Item.objects.filter(category__list__owner=user).order_by(
            "category__id", "display_order"
        )


class ItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = UpdateItemSerializer
    permission_classes = [ItemIsOwnedBy]
