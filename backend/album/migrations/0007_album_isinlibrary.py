# Generated by Django 5.1.6 on 2025-04-24 15:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('album', '0006_alter_albumsong_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='album',
            name='isInLibrary',
            field=models.BooleanField(default=False),
        ),
    ]
