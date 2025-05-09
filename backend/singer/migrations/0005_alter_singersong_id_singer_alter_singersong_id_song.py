# Generated by Django 5.1.6 on 2025-04-21 19:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('singer', '0004_rename_singer_singersong_id_singer_and_more'),
        ('song', '0006_song_file_audio_song_file_video_song_url_video'),
    ]

    operations = [
        migrations.AlterField(
            model_name='singersong',
            name='id_singer',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='singer_songs', to='singer.singer'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='singersong',
            name='id_song',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='song_singers', to='song.song'),
            preserve_default=False,
        ),
    ]