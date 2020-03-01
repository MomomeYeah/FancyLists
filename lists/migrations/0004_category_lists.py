# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lists', '0003_item'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='lists',
            field=models.ManyToManyField(to="lists.FancyList", through="lists.FancyListCategory"),
            preserve_default=True,
        ),
    ]
