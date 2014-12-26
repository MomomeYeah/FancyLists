from django.db import models
from django.db.models import Max
from django.utils import timezone
from django.contrib.auth.models import User

class FancyListManager(models.Manager):
    def create_list(self, name, user):
        fancylist = self.create(name = name, created_date = timezone.now(), created_by = user)
        fancylist.save()
        return fancylist

    # Create a new FancyList as a direct copy of to_copy_list
    def duplicate_list(self, name, to_copy_list):
        fancylist = self.create(name = name, created_date = timezone.now(), created_by = to_copy_list.created_by)
        fancylist.save()
        for flc in FancyListCategory.objects.filter(FancyList = to_copy_list.id):
            FancyListCategory.objects.duplicate_list_category(fancylist, flc)
        return fancylist

class CategoryManager(models.Manager):
    def create_category(self, name):
        category = self.create(name = name)
        category.save()
        return category

class FancyListCategoryManager(models.Manager):
    def create_list_category(self, fancylist, category):
        agg_set = FancyListCategory.objects.filter(FancyList__id = fancylist.id).aggregate(max_do = Max('display_order'))
        max_display_order = agg_set.get('max_do')
        if max_display_order == None:
            max_display_order = 0
        else:
            max_display_order += 1 
        listCategory = self.create(FancyList = fancylist, Category = category, display_order = max_display_order)
        listCategory.save()
        return listCategory

    # Create a new FancyListCategory using the Category and display_order from fancylistcategory, pointing to fancylist
    def duplicate_list_category(self, fancylist, fancylistcategory):
        listCategory = self.create(FancyList = fancylist, Category = fancylistcategory.Category, display_order = fancylistcategory.display_order)
        listCategory.save()
        for flci in FancyListCategoryItem.objects.filter(FancyListCategory = fancylistcategory):
            FancyListCategoryItem.objects.duplicate_list_category_item(listCategory, flci)
        return listCategory

class ItemManager(models.Manager):
    def create_item(self, name):
        item = self.create(name = name)
        item.save()
        return item

class FancyListCategoryItemManager(models.Manager):
    def create_list_category_item(self, fancylistcategory, item):
        agg_set = FancyListCategoryItem.objects.filter(FancyListCategory__id = fancylistcategory.id).aggregate(max_do = Max('display_order'))
        max_display_order = agg_set.get('max_do')
        if max_display_order == None:
            max_display_order = 0
        else:
            max_display_order += 1 
        listCategoryItem = self.create(FancyListCategory = fancylistcategory, Item = item, display_order = max_display_order)
        listCategoryItem.save()
        return listCategoryItem

    # Create a new FancyListCategoryItem using the Item and display_order from fancylistcategoryitem, pointing to fancylistcategory
    def duplicate_list_category_item(self, fancylistcategory, fancylistcategoryitem):
        listCategoryItem = self.create(FancyListCategory = fancylistcategory, Item = fancylistcategoryitem.Item, display_order = fancylistcategoryitem.display_order)
        listCategoryItem.save()
        return listCategoryItem

class FancyList(models.Model):
    name = models.CharField(max_length = 100)
    created_date = models.DateTimeField()
    created_by = models.ForeignKey(User)

    def __unicode__(self):
        return self.name

    def sortedListCategories(self):
        return self.fancylistcategory_set.order_by('display_order')

    def reorder_list_categories(self):
        index = 0
        for listCategory in self.fancylistcategory_set.all():
            listCategory.set_display_order(index)
            index += 1

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
    display_order = models.IntegerField()

    def __unicode__(self):
        return self.FancyList.name + ' - ' + self.Category.name

    def sortedItems(self):
        return self.fancylistcategoryitem_set.order_by('display_order')

    def reorder_items(self):
        index = 0
        for item in self.fancylistcategoryitem_set.all():
            item.set_display_order(index)
            index += 1

    def set_display_order(self, display_order):
        self.display_order = display_order
        self.save()

    def increment_display_order(self):
        self.display_order += 1
        self.save()

    def decrement_display_order(self):
        self.display_order -= 1
        self.save()

    objects = FancyListCategoryManager()

class Item(models.Model):
    name = models.CharField(max_length = 100)
    listCategory = models.ManyToManyField(FancyListCategory, through = 'FancyListCategoryItem', null = True)

    def __unicode__(self):
        return self.name

    def add_list_category(self, list_category_id):
        self.listCategory.add(list_category_id)
        self.save()

    def remove_list_category(self, list_category_id):
        self.listCategory.remove(list_category_id)
        self.save()

    objects = ItemManager()

class FancyListCategoryItem(models.Model):
    FancyListCategory = models.ForeignKey(FancyListCategory)
    Item = models.ForeignKey(Item)
    display_order = models.IntegerField()

    def __unicode__(self):
        return self.FancyListCategory.FancyList.name + ' - ' + self.FancyListCategory.Category.name + ' - ' + self.Item.name

    def set_display_order(self, display_order):
        self.display_order = display_order
        self.save()

    def increment_display_order(self):
        self.display_order += 1
        self.save()

    def decrement_display_order(self):
        self.display_order -= 1
        self.save()

    objects = FancyListCategoryItemManager()

