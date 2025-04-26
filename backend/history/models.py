from django.db import models
from django.contrib.auth.models import User
from song.models import Song
from genre.models import Genre
from singer.models import Singer

class History(models.Model):
    id = models.BigAutoField(primary_key=True)
    id_song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='song_history')
    id_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_history')
    listen_date = models.DateTimeField()
    play_duration = models.IntegerField(default=0)  
    id_genre = models.ForeignKey(Genre, on_delete=models.CASCADE, related_name='genre_history', null=True)
    id_singer = models.ForeignKey(Singer, on_delete=models.CASCADE, related_name='singer_history', null=True)
    listen_count = models.IntegerField(default=1)  

    class Meta:
        db_table = 'history_history'

    def __str__(self):
        return f"History: {self.id_song.name}"  