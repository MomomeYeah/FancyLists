from lists.models import FancyList, Category, Item
from lists.serializers import (
    FancyListListSerializer, FancyListSerializer,
    CategorySerializer, UpdateCategorySerializer,
    ItemSerializer, UpdateItemSerializer
)
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'lists': reverse('api:list-list', request=request, format=format),
        'categories': reverse('api:category-list', request=request, format=format),
        'items': reverse('api:item-list', request=request, format=format)
    })


class FancyListList(generics.ListCreateAPIView):
    queryset = FancyList.objects.all().order_by('display_order')
    serializer_class = FancyListListSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class FancyListDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FancyList.objects.all()
    serializer_class = FancyListSerializer


class CategoryList(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by('list__id', 'display_order')
    serializer_class = CategorySerializer


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = UpdateCategorySerializer


class ItemList(generics.ListCreateAPIView):
    queryset = Item.objects.all().order_by('category__id', 'display_order')
    serializer_class = ItemSerializer


class ItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = UpdateItemSerializer