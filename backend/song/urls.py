
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.views import SongViewSet
from .views import SongListView, StreamSongView

router = DefaultRouter()
router.register(r'songs', SongViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("songs/", SongListView.as_view(), name="song-list"),
    path("stream/<int:song_id>/", StreamSongView.as_view(), name="stream-song"),
]

