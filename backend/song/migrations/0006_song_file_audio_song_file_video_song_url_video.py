# Generated by Django 5.1.6 on 2025-03-31 18:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('song', '0005_remove_song_id_genre_id_song_id_genre_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='file_audio',
            field=models.FileField(blank=True, null=True, upload_to=''),
        ),
        migrations.AddField(
            model_name='song',
            name='file_video',
            field=models.FileField(blank=True, null=True, upload_to=''),
        ),
        migrations.AddField(
            model_name='song',
            name='url_video',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
