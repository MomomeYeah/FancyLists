from django.contrib import admin

from lists.models import FancyList, Category, Item


@admin.register(FancyList)
class FancyListAdmin(admin.ModelAdmin):
    fields = ["name", "owner", "created_date", "display_order"]

    list_display = ["name", "owner", "display_order"]
    ordering = ["owner", "display_order"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    fields = ["name", "list", "display_order"]

    list_display = [
        "name",
        "category_owner",
        "list",
        "display_order"
        ]
    ordering = [
        "list__owner",
        "list__display_order",
        "display_order"
        ]

    @admin.display(description="Owner")
    def category_owner(self, category):
        return category.list.owner


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    fields = ["name", "category", "display_order"]

    list_display = [
        "name",
        "item_owner",
        "item_list",
        "category",
        "display_order"
        ]
    ordering = [
        "category__list__owner",
        "category__list__display_order",
        "category__display_order",
        "display_order"
        ]

    @admin.display(description="Owner")
    def item_owner(self, item):
        return item.category.list.owner

    @admin.display(description="List")
    def item_list(self, item):
        return item.category.list