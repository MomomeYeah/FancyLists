# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        (b'lists', b'0003_item'),
    ]

    operations = [
        migrations.AddField(
            model_name=b'category',
            name=b'lists',
            field=models.ManyToManyField(to=b'lists.FancyList', through=b'lists.FancyListCategory'),
            preserve_default=True,
        ),
    ]
