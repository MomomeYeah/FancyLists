# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lists', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='FancyListCategory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('FancyList', models.ForeignKey(to="lists.FancyList", to_field='id')),
                ('Category', models.ForeignKey(to="lists.Category", to_field='id')),
                ('display_order', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='FancyListCategoryItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('FancyListCategory', models.ForeignKey(to="lists.FancyListCategory", to_field='id')),
                ('display_order', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
