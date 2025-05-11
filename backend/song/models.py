from django.db import models
from genre.models import Genre
import json
from song.utils import upload_mp3_file
from song.utils import upload_video_file
from song.utils import upload_lyric_file
from song.fingerprint import get_audio_fingerprint
# Create your models here.
class Song(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField()
    name = models.CharField(max_length=255)
    popularity = models.IntegerField()
    release_date = models.DateField()
    url_lyric = models.CharField(max_length=255, null=True, blank=True)
    url_song = models.CharField(max_length=255, null=True, blank=True)
    url_video=models.CharField(max_length=255, null=True, blank=True)
    file_audio=models.FileField( blank=True, null=True) 
    file_video=models.FileField(blank=True,null=True)
    file_lyric=models.FileField(blank=True,null=True)
    is_vip = models.BooleanField(default=False)
    id_genre = models.ForeignKey(Genre, on_delete=models.CASCADE, related_name='songs', db_column='id_genre_id', default=1)
    fingerprint = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'song_song'

   

    def save(self, *args, **kwargs):
        is_new = self._state.adding  
        try:
             old = Song.objects.get(pk=self.pk)
        except Song.DoesNotExist:
            old = None

        super().save(*args, **kwargs)  # Lưu model trước để có đường dẫn file
        file_audio_url = None
        file_video_url = None
        file_lyric_url =  None

        if self.file_audio and (is_new or (old and old.file_audio != self.file_audio)):
            file_path = self.file_audio.path
            try:
                fp = get_audio_fingerprint(file_path)
                self.fingerprint = json.dumps(fp.tolist())
                super().save(update_fields=['fingerprint'])
            except Exception as e:
                print(f"Lỗi khi tạo fingerprint: {e}")
            file_audio_url = upload_mp3_file(file_path)
        if file_audio_url:
            self.url_song = file_audio_url
            super().save(update_fields=['url_song'])

  
        if self.file_video and (is_new or (old and old.file_video != self.file_video)):
            file_path = self.file_video.path
            file_video_url = upload_video_file(file_path)
        if file_video_url:
            self.url_video = file_video_url
            super().save(update_fields=['url_video'])
        
        if self.file_lyric and (is_new or (old and old.file_lyric !=self.file_lyric)):
            file_path=self.file_lyric.path
            file_lyric_url=upload_lyric_file(file_path)
        if file_lyric_url:
            self.url_lyric=file_lyric_url
            super().save(update_fields=['url_lyric'])


    def __str__(self):
        return self.name