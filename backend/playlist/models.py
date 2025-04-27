from django.db import models
from song.models import Song

# Create your models here.
class Playlist(models.Model):
    id = models.BigAutoField(primary_key=True)
    create_date = models.DateField()
    is_active = models.BooleanField()
    name = models.CharField(max_length=255, unique=True)
    id_user = models.BigIntegerField()
    image = models.CharField(max_length=255, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'playlist_playlist'

    def __str__(self):
        return self.name
    
class PlaylistSong(models.Model):  # Cho spotify_clone_playlist_song
    id_playlist = models.ForeignKey('Playlist', on_delete=models.CASCADE, related_name='playlist_songs')
    id_song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='song_playlists')
    date_added = models.DateTimeField(auto_now_add=True, null=True)
    
    class Meta:
        db_table = 'playlist_playlistsong'
        # Thêm ràng buộc unique_together để ngăn trùng lặp
        unique_together = ('id_playlist', 'id_song')

    def __str__(self):
        return f"PlaylistSong: {self.id_playlist} - {self.id_song}"