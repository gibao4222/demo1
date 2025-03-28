# Generated by Django 5.1.6 on 2025-03-15 11:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spotify_user', '0004_delete_user_spotifyuser_groups_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='spotifyuser',
            name='groups',
        ),
        migrations.RemoveField(
            model_name='spotifyuser',
            name='is_superuser',
        ),
        migrations.RemoveField(
            model_name='spotifyuser',
            name='last_login',
        ),
        migrations.RemoveField(
            model_name='spotifyuser',
            name='user_permissions',
        ),
        migrations.AlterField(
            model_name='spotifyuser',
            name='password',
            field=models.CharField(max_length=255),
        ),
    ]
