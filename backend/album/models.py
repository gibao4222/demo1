from django.db import models

class Album(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.CharField(max_length=255)
    is_active = models.BooleanField()
    name = models.CharField(max_length=255)
    popularity = models.IntegerField()
    release_date = models.DateField(null=True, blank=True)
    id_singer = models.ForeignKey('singer.Singer', on_delete=models.CASCADE, related_name='albums', default=1)
    isInLibrary = models.BooleanField(default=False)

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
        # Thêm ràng buộc unique để đảm bảo mỗi bài hát chỉ thuộc một album
        unique_together = [['id_song']]  # Mỗi id_song chỉ xuất hiện một lần

    def __str__(self):
        return f"AlbumSong: {self.id_album} - {self.id_song}"