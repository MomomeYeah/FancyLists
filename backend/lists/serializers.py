from django.db import transaction
from django.db.models import F, Max
from django.utils import timezone

from lists.models import FancyList, Category, Item
from dj_rest_auth.registration.serializers import RegisterSerializer as DJRegisterSerializer
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import PermissionDenied, ValidationError



class RegisterSerializer(DJRegisterSerializer):
    def custom_signup(self, request, user):
        user.is_superuser = True
        user.save()
        token = Token.objects.create(user=user)


class ReorderableSerializer(serializers.ModelSerializer):
    @transaction.atomic
    def update(self, instance, validated_data):
        siblings = instance.get_siblings()

        # recalculate display order for items between the old and new positions
        if "display_order" in validated_data and instance.display_order != validated_data["display_order"]:
            if instance.display_order < validated_data["display_order"]:
                siblings\
                    .filter(display_order__gte=instance.display_order)\
                    .filter(display_order__lte=validated_data["display_order"])\
                    .exclude(id=instance.id)\
                    .update(display_order=F("display_order") - 1)
            else:
                siblings\
                    .filter(display_order__gte=validated_data["display_order"])\
                    .filter(display_order__lte=instance.display_order)\
                    .exclude(id=instance.id)\
                    .update(display_order=F("display_order") + 1)

        return super().update(instance, validated_data)
                
    def validate_display_order(self, display_order):
        # model validation ensures display_order is a valid integer
        instance = getattr(self, "instance", None)
        if instance:
            if display_order < 1:
                raise ValidationError("Display order must be greater than zero")

            siblings = instance.get_siblings()
            if display_order > len(siblings):
                raise ValidationError("Display order must be less than or equal to the number of siblings")

        return display_order


class ItemSerializer(ReorderableSerializer):
    def create(self, validated_data):
        display_order = Item.objects.\
            filter(category = validated_data.get("category")).\
            aggregate(Max('display_order', default=0)).\
            get("display_order__max") + 1
        
        return Item.objects.create(
            name=validated_data.get("name"),
            category=validated_data.get("category"),
            display_order=display_order
        )
    
    # DRF will correct run permission class validation on LIST, GET, 
    # DELETE, and UPDATE, but not on CREATE
    def validate_category(self, category):
        # DRF will ensure that the specified category exists
        if category.list.owner == self.context['request'].user:
            return category
        
        raise PermissionDenied(detail=None, code=None)

    class Meta:
        model = Item
        fields = ["id", "name", "category", "display_order"]
        read_only_fields = ["id", "display_order"]

class UpdateItemSerializer(ItemSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "category", "display_order"]
        read_only_fields = ["id", "category"]


class CategorySerializer(ReorderableSerializer):
    items = serializers.SerializerMethodField("get_items")

    def get_items(self, instance):
        return ItemSerializer(
            Item.objects
                .filter(category=instance)
                .order_by('display_order'),
            many=True).data

    def create(self, validated_data):
        display_order = Category.objects.\
            filter(list = validated_data.get("list")).\
            aggregate(Max('display_order', default=0)).\
            get("display_order__max") + 1
        
        return Category.objects.create(
            name=validated_data.get("name"),
            list=validated_data.get("list"),
            display_order=display_order
        )

    # DRF will correct run permission class validation on LIST, GET, 
    # DELETE, and UPDATE, but not on CREATE
    def validate_list(self, fancylist):
        # DRF will ensure that the specified fancylist exists
        if fancylist.owner == self.context['request'].user:
            return fancylist
        
        raise PermissionDenied(detail=None, code=None)

    class Meta:
        model = Category
        fields = ["id", "name", "list", "display_order", "items"]
        read_only_fields = ["id", "display_order", "items"]

class UpdateCategorySerializer(CategorySerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "list", "display_order", "items"]
        read_only_fields = ["id", "list", "items"]


class FancyListListSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField()

    def create(self, validated_data):
        display_order = FancyList.objects.\
            filter(owner = validated_data.get("owner")).\
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

class FancyListSerializer(ReorderableSerializer):
    owner = serializers.StringRelatedField()
    categories = serializers.SerializerMethodField("get_categories")

    def get_categories(self, instance):
        return CategorySerializer(
            Category.objects
                .filter(list=instance)
                .order_by('display_order'),
            many=True).data

    class Meta:
        model = FancyList
        fields = ["id", "name", "created_date", "owner", "display_order", "categories"]
        read_only_fields = ["id", "created_date", "owner", "categories"]