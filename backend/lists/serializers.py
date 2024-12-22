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
    def get_parent(self, instance, validated_data):
        raise NotImplementedError

    @transaction.atomic
    def update(self, instance, validated_data):
        # get all siblings, accounting for whether the parent has changed
        parent = self.get_parent(instance, validated_data)
        siblings = self.Meta.model.get_siblings(parent=parent)
        # remove the element being updated from the set of siblings
        siblings_excluding_self = [s for s in siblings if s.id != instance.id]
        # put the element being updated in the correct position
        reordered_siblings =\
            siblings_excluding_self[:validated_data["display_order"]] +\
            [instance] +\
            siblings_excluding_self[validated_data["display_order"]:]
        
        # re-normalise display orders
        for idx, sibling in enumerate(reordered_siblings):
            sibling.display_order = idx + 1
            sibling.save()

        # update the display order of the element being updated to be 1-indexed
        # rather than 0-indexed
        validated_data["display_order"] += 1
        return super().update(instance, validated_data)


class ItemSerializer(ReorderableSerializer):
    def get_parent(self, instance, validated_data):
        return validated_data.get("category") or instance.category

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
        read_only_fields = ["id"]


class CategorySerializer(ReorderableSerializer):
    items = serializers.SerializerMethodField("get_items")

    def get_items(self, instance):
        return ItemSerializer(
            Item.objects
                .filter(category=instance)
                .order_by('display_order'),
            many=True).data
    
    def get_parent(self, instance, validated_data):
        return validated_data.get("list") or instance.list

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
    items = serializers.SerializerMethodField("get_items")

    def get_categories(self, instance):
        return CategorySerializer(
            Category.objects
                .filter(list=instance)
                .order_by('display_order'),
            many=True).data
    
    def get_items(self, instance):
        return ItemSerializer(
            Item.objects
                .filter(category__list=instance)
                .order_by('display_order'),
            many=True).data
    
    def get_parent(self, instance, validated_data):
        return validated_data.get("owner") or instance.owner

    class Meta:
        model = FancyList
        fields = ["id", "name", "created_date", "owner", "display_order", "categories", "items"]
        read_only_fields = ["id", "created_date", "owner", "categories", "items"]