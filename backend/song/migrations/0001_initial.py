# Generated by Django 5.1.6 on 2025-03-12 15:41

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Song',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('image', models.CharField(max_length=255)),
                ('is_active', models.BooleanField()),
                ('name', models.CharField(max_length=255)),
                ('popularity', models.IntegerField()),
                ('release_date', models.DateField()),
                ('url_lyric', models.CharField(max_length=255)),
                ('url_song', models.CharField(max_length=255)),
                ('id_genre', models.BigIntegerField()),
            ],
        ),
    ]
