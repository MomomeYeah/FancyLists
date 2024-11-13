from rest_framework import permissions


class ListIsOwnedBy(permissions.BasePermission):
    """Lists should only be accessible to their owners"""

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
    
class CategoryIsOwnedBy(permissions.BasePermission):
    """Categories should only be accessible to the owner of their respective list"""

    def has_object_permission(self, request, view, obj):
        return obj.list.owner == request.user
    
class ItemIsOwnedBy(permissions.BasePermission):
    """Categories should only be accessible to the owner of their respective list"""

    def has_object_permission(self, request, view, obj):
        return obj.category.list.owner == request.user