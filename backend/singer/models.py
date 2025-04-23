from django.db import models

# Create your models here.
class Singer(models.Model):
    id = models.BigAutoField(primary_key=True)
    birthday = models.DateField()
    description = models.CharField(max_length=255)
    followers = models.IntegerField()
    image = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'singer_singer'

    def __str__(self):
        return self.name
    
class SingerSong(models.Model):  # Cho spotify_clone_singer_song
    id = models.BigAutoField(primary_key=True)
    id_singer = models.ForeignKey(Singer, on_delete=models.CASCADE, related_name='singer_songs')
    id_song = models.ForeignKey('song.Song', on_delete=models.CASCADE, related_name='song_singers')

    class Meta:
        db_table = 'singer_singersong'
        
    def __str__(self):
        return f"SingerSong: {self.id_singer} - {self.id_song}"