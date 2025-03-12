from django.urls import path
from . import views

urlpatterns = [
    path('genres/', views.genre_list, name='genre_list'),
]