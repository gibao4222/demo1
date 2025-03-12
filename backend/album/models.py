from django.db import models

# Create your models here.
class Album(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.CharField(max_length=255)
    is_active = models.BooleanField()
    name = models.CharField(max_length=255)
    popularity = models.IntegerField()

    class Meta:
        db_table = 'album_album'

    def __str__(self):
        return self.name
    
class AlbumSong(models.Model):  # Cho spotify_clone_album_song
    id_album = models.BigIntegerField()
    id_song = models.BigIntegerField()

    class Meta:
        db_table = 'album_albumsong'

    def __str__(self):
        return f"AlbumSong: {self.id_album} - {self.id_song}"
    
class SingerAlbum(models.Model):  # Cho spotify_clone_singer_album
    id_singer = models.BigIntegerField()
    id_album = models.BigIntegerField()
    
    class Meta:
        db_table = 'album_singeralbum'

    def __str__(self):
        return f"SingerAlbum: {self.id_singer} - {self.id_album}"