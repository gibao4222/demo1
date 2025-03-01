from django.db import models

# Create your models here.
class Product(models.Model):
	name = models.CharField(max_length=255)
	description = models.TextField(blank=True, null=True)
	price = models.DecimalField(max_digits=10, decimal_places=2)
	stock = models.PositiveIntegerField()
	image = models.ImageField(upload_to='products/img',blank=True, null=True)
	create_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name
