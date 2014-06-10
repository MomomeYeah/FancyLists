# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        (b'lists', b'0003_category_lists'),
    ]

    operations = [
        migrations.AddField(
            model_name=b'fancylistcategoryitem',
            name=b'Item',
            field=models.ForeignKey(to=b'lists.Item', to_field='id'),
            preserve_default=True,
        ),
    ]
