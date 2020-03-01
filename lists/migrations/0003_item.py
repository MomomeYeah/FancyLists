# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lists', '0002_fancylistcategory_fancylistcategoryitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('listCategory', models.ManyToManyField(to="lists.FancyListCategory", null=True, through="lists.FancyListCategoryItem")),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
