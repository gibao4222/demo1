from django.db import models

# Create your models here.
class Genre(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'genre_genre'

    def __str__(self):
        return self.name