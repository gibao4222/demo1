from django.db import models
from genre.models import Genre
from song.utils import upload_mp3_file
from song.utils import upload_video_file
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
    url_video=models.CharField(max_length=255,null=True)
    file_audio=models.FileField( blank=True, null=True) 
    file_video=models.FileField(blank=True,null=True)
    id_genre = models.ForeignKey(Genre, on_delete=models.CASCADE, related_name='songs', db_column='id_genre_id', default=1)

    class Meta:
        db_table = 'song_song'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Lưu model trước để có đường dẫn file
    
        if self.file_audio:
            file_path = self.file_audio.path  # Lấy đường dẫn file từ FileField
            file_audio_url = upload_mp3_file(file_path)  
            if file_audio_url:
                self.url_song = file_audio_url
                super().save(update_fields=['url_song'])  # Cập nhật lại chỉ trường này

        if self.file_video:
            file_path = self.file_video.path
            file_video_url = upload_video_file(file_path)
            if file_video_url:
                self.url_video = file_video_url
                super().save(update_fields=['url_video'])

    def __str__(self):
        return self.name