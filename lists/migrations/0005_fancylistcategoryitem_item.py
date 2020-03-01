# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lists', '0004_category_lists'),
    ]

    operations = [
        migrations.AddField(
            model_name='fancylistcategoryitem',
            name='Item',
            field=models.ForeignKey(to="lists.Item", to_field='id'),
            preserve_default=True,
        ),
    ]
