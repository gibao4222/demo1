from django.db import models
from genre.models import Genre

# Create your models here.
class Song(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField()
    name = models.CharField(max_length=255)
    popularity = models.IntegerField()
    release_date = models.DateField()
    url_lyric = models.CharField(max_length=255)
    url_song = models.CharField(max_length=255)
    id_genre = models.ForeignKey(Genre, on_delete=models.CASCADE, related_name='songs', db_column='id_genre_id', default=1)

    class Meta:
        db_table = 'song_song'
        
    def __str__(self):
        return self.name