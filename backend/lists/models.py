from django.db import models, transaction
from django.contrib.auth.models import User


class AbstractReorderable(models.Model):
    display_order = models.IntegerField()

    def get_siblings(self):
        return User.objects.none()

    def normalize_display_orders(self):
        for idx, sibling in enumerate(self.get_siblings()):
            sibling.display_order = idx + 1
            sibling.save()

    def delete(self):
        with transaction.atomic():
            super().delete()
            self.normalize_display_orders()

    class Meta:
        abstract = True


class FancyList(AbstractReorderable):
    name = models.CharField(max_length=100)
    created_date = models.DateTimeField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    def get_siblings(self):
        return FancyList.objects.filter(owner=self.owner).order_by("display_order")
    
    class Meta:
        verbose_name_plural = 'FancyLists'


class Category(AbstractReorderable):
    name = models.CharField(max_length=100)
    list = models.ForeignKey(FancyList, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    def get_siblings(self):
        return Category.objects.filter(list=self.list).order_by("display_order")
    
    class Meta:
        verbose_name_plural = 'Categories'


class Item(AbstractReorderable):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    def get_siblings(self):
        return Item.objects.filter(category=self.category).order_by("display_order")