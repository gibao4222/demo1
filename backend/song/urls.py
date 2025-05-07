from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.views import SongViewSet, SongRelatedSinger, SingerSongListView
from .views import SongListView, StreamSongView

router = DefaultRouter()
router.register(r'songs', SongViewSet, basename='songs')

urlpatterns = [
    path('', include(router.urls)),

    path('create-song/', SongViewSet.as_view({'post': 'create_song'}), name='song-create'),
    path('change-song/<int:pk>/', SongViewSet.as_view({'put': 'change_song'}), name='song-change'),
    path('delete-song/<int:pk>/', SongViewSet.as_view({'delete': 'delete_song'}), name='song-delete'),
    path("songs/", SongListView.as_view(), name="song-list"),
    path("stream/<int:song_id>/", StreamSongView.as_view(), name="stream-song"),
    path("related-songs/<int:pk>", SongRelatedSinger.as_view(),name='related-songs'),
    path('singers/<int:singer_id>/songs/', SingerSongListView.as_view(), name='singer-songs'),
    path('search-by-audio/', SongViewSet.as_view({'post': 'search_song_by_audio'}), name='search_by_audio'),
]


