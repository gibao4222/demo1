from django.urls import path
from . import views

urlpatterns = [
    path('spotify-users/', views.spotify_user_list, name='spotify_user_list'),
]