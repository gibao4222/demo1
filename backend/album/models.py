from django.db import models

class Album(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.CharField(max_length=255)
    is_active = models.BooleanField()
    name = models.CharField(max_length=255)
    popularity = models.IntegerField()
    release_date = models.DateField(null=True, blank=True)
    id_singer = models.ForeignKey('singer.Singer', on_delete=models.CASCADE, related_name='albums', default=1)

    class Meta:
        db_table = 'album_album'

    def __str__(self):
        return self.name

class AlbumSong(models.Model):
    id = models.BigAutoField(primary_key=True)
    id_album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='album_songs')
    id_song = models.ForeignKey('song.Song', on_delete=models.CASCADE, related_name='song_albums')

    class Meta:
        db_table = 'album_albumsong'

    def __str__(self):
        return f"AlbumSong: {self.id_album} - {self.id_song}"