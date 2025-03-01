from django.urls import path
from .views import product_list

urlpatterns = [
	path('api/products/', product_list, name = 'product-list'),
	#path('add/', product_create, name = 'product_create'),
	#path('<int:pk>/edit/', product_update, name = 'product_update'),
	#path('<int:pk>/delete/', product_delete, name = 'product_delete'),
]
