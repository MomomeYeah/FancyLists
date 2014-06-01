from django.db import models
from django.utils import timezone

class FancyListManager(models.Manager):
    def create_list(self, name):
        fancylist = self.create(name = name, created_date = timezone.now())
        fancylist.save()
        return fancylist

class CategoryManager(models.Manager):
    def create_category(self, name):
        category = self.create(name = name)
        category.save()
        return category

class FancyListCategoryManager(models.Manager):
    def create_list_category(self, fancylist, category):
        listCategory = self.create(FancyList = fancylist, Category = category)
        listCategory.save()
        return listCategory

class ItemManager(models.Manager):
    def create_item(self, name):
        item = self.create(name = name)
        item.save()
        return item

class FancyList(models.Model):
    name = models.CharField(max_length = 100)
    created_date = models.DateTimeField()

    def __unicode__(self):
        return self.name

    objects = FancyListManager()

class Category(models.Model):
    name = models.CharField(max_length = 100)
    lists = models.ManyToManyField(FancyList, through = 'FancyListCategory')

    def __unicode__(self):
        return self.name

    objects = CategoryManager()

class FancyListCategory(models.Model):
    FancyList = models.ForeignKey(FancyList)
    Category = models.ForeignKey(Category)

    def __unicode__(self):
        return self.FancyList.name + ' - ' + self.Category.name

    objects = FancyListCategoryManager()

class Item(models.Model):
    name = models.CharField(max_length = 100)
    listCategory = models.ManyToManyField(FancyListCategory, null = True)

    def __unicode__(self):
        return self.name

    def add_list_category(self, list_category_id):
        self.listCategory.add(list_category_id)
        self.save()

    def remove_list_category(self, list_category_id):
        self.listCategory.remove(list_category_id)
        self.save()

    objects = ItemManager()
