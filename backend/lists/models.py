from django.db import models
from django.contrib.auth.models import User


class FancyList(models.Model):
    name = models.CharField(max_length=100)
    created_date = models.DateTimeField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    display_order = models.IntegerField()

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    list = models.ForeignKey(FancyList, on_delete=models.CASCADE)
    display_order = models.IntegerField()

    def __str__(self):
        return self.name


class Item(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    display_order = models.IntegerField()

    def __str__(self):
        return self.name
