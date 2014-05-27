from django.db import models
from django.utils import timezone

class ListManager(models.Manager):
    def create_list(self, name):
        book = self.create(name = name, created_date = timezone.now())
        return book

class CategoryManager(models.Manager):
    def create_category(self, name):
        category = self.create(name = name)
        return category

class ItemManager(models.Manager):
    def create_item(self, name):
        item = self.create(name = name)
        return item

class List(models.Model):
    name = models.CharField(max_length = 100)
    created_date = models.DateTimeField()

    def __unicode__(self):
        return self.name

    objects = ListManager()

class Category(models.Model):
    name = models.CharField(max_length = 100)
    lists = models.ManyToManyField(List)

    def __unicode__(self):
        return self.name

    def add_list(self, list_id):
        self.lists.add(list_id)
        self.save()

    def remove_list(self, list_id):
        self.lists.remove(list_id)
        self.save()

    objects = CategoryManager()

class Item(models.Model):
    name = models.CharField(max_length = 100)
    categories = models.ManyToManyField(Category)

    def __unicode__(self):
        return self.name

    objects = ItemManager()