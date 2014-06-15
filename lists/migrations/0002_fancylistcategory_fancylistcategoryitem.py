# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        (b'lists', b'0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name=b'FancyListCategory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                (b'FancyList', models.ForeignKey(to=b'lists.FancyList', to_field='id')),
                (b'Category', models.ForeignKey(to=b'lists.Category', to_field='id')),
                (b'display_order', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name=b'FancyListCategoryItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                (b'FancyListCategory', models.ForeignKey(to=b'lists.FancyListCategory', to_field='id')),
                (b'display_order', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
