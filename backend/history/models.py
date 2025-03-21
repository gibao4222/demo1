from django.db import models

# Create your models here.
class History(models.Model):
    id = models.BigAutoField(primary_key=True)
    id_song = models.BigIntegerField()
    id_user = models.BigIntegerField()
    listen_date = models.DateTimeField()
    name = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'history_history'

    def __str__(self):
        return f"History: {self.name}"