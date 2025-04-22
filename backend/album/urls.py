from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.views import AlbumViewSet, AlbumSongViewSet

router = DefaultRouter()
router.register(r'albums', AlbumViewSet)
router.register(r'album-songs', AlbumSongViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # AlbumSong
    path('create-album-song/', AlbumSongViewSet.as_view({'post': 'create_album_song'}), name='album-song-create'),
    path('change-album-song/<int:pk>/', AlbumSongViewSet.as_view({'put': 'change_album_song'}), name='album-song-change'),
    path('delete-album-song/<int:pk>/', AlbumSongViewSet.as_view({'delete': 'delete_album_song'}), name='album-song-delete'),

    # Album
    path('create-album/', AlbumViewSet.as_view({'post': 'create_album'}), name='album-create'),
    path('change-album/<int:pk>/', AlbumViewSet.as_view({'put': 'change_album'}), name='album-change'),
    path('delete-album/<int:pk>/', AlbumViewSet.as_view({'delete': 'delete_album'}), name='album-delete'),
]