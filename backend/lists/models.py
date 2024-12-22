from django.db import models, transaction
from django.contrib.auth.models import User


class AbstractReorderable(models.Model):
    display_order = models.IntegerField()

    @staticmethod
    def get_siblings(parent):
        raise NotImplementedError

    class Meta:
        abstract = True


class FancyList(AbstractReorderable):
    name = models.CharField(max_length=100)
    created_date = models.DateTimeField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    @staticmethod
    def get_siblings(parent):
        return FancyList.objects.filter(owner=parent).order_by("display_order")
    
    class Meta:
        verbose_name_plural = 'FancyLists'


class Category(AbstractReorderable):
    name = models.CharField(max_length=100)
    list = models.ForeignKey(FancyList, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    @staticmethod
    def get_siblings(parent):
        return Category.objects.filter(list=parent).order_by("display_order")
    
    class Meta:
        verbose_name_plural = 'Categories'


class Item(AbstractReorderable):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    @staticmethod
    def get_siblings(parent):
        return Item.objects.filter(category=parent).order_by("display_order")