# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        (b'lists', b'0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name=b'Item',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                (b'name', models.CharField(max_length=100)),
                (b'categories', models.ManyToManyField(to=b'lists.Category')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
