from lists.models import FancyList, Category, Item
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from django.db.models import Max
from django.utils import timezone


class ItemSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        display_order = Item.objects.\
            filter(category__id = validated_data.get("category").id).\
            aggregate(Max('display_order', default=0)).\
            get("display_order__max") + 1
        
        return Item.objects.create(
            name=validated_data.get("name"),
            category=validated_data.get("category"),
            display_order=display_order
        )

    # DRF will correct run permission class validation on LIST, GET, 
    # DELETE, and UPDATE, but not on CREATE
    def validate(self, data):
        category = data['category']
        if category.list.owner == self.context['request'].user:
            return data
        
        raise PermissionDenied(detail=None, code=None)

    class Meta:
        model = Item
        fields = ["id", "name", "category", "display_order"]
        read_only_fields = ["id", "display_order"]

class UpdateItemSerializer(ItemSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "category", "display_order"]
        read_only_fields = ["id", "category", "display_order"]


class CategorySerializer(serializers.ModelSerializer):
    items = ItemSerializer(source="item_set", many=True, required=False)

    def create(self, validated_data):
        display_order = Category.objects.\
            filter(list__id = validated_data.get("list").id).\
            aggregate(Max('display_order', default=0)).\
            get("display_order__max") + 1
        
        return Category.objects.create(
            name=validated_data.get("name"),
            list=validated_data.get("list"),
            display_order=display_order
        )

    # DRF will correct run permission class validation on LIST, GET, 
    # DELETE, and UPDATE, but not on CREATE
    def validate(self, data):
        list = data['list']
        if list.owner == self.context['request'].user:
            return data
        
        raise PermissionDenied(detail=None, code=None)

    class Meta:
        model = Category
        fields = ["id", "name", "list", "display_order", "items"]
        read_only_fields = ["id", "display_order", "items"]

class UpdateCategorySerializer(CategorySerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "list", "display_order", "item_set"]
        read_only_fields = ["id", "list", "display_order", "item_set"]


class FancyListListSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField()

    def create(self, validated_data):
        display_order = FancyList.objects.\
            aggregate(Max('display_order', default=0)).\
            get("display_order__max") + 1
        
        return FancyList.objects.create(
            name=validated_data.get("name"),
            created_date=timezone.now(),
            owner=validated_data.get("owner"),
            display_order=display_order
        )

    class Meta:
        model = FancyList
        fields = ["id", "name", "created_date", "owner", "display_order"]
        read_only_fields = ["id", "created_date", "owner", "display_order"]

class FancyListSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField()
    categories = CategorySerializer(source="category_set", many=True)

    class Meta:
        model = FancyList
        fields = ["id", "name", "created_date", "owner", "display_order", "categories"]
        read_only_fields = ["id", "created_date", "owner", "display_order", "categories"]