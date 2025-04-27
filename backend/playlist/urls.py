from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlaylistViewSet, PlaylistSongViewSet
from .views.views import UserPlaylistListView
from . import color_extraction
# Tạo router cho các endpoint mặc định
router = DefaultRouter()
router.register(r'playlists', PlaylistViewSet, basename='playlists')
router.register(r'playlist-songs', PlaylistSongViewSet, basename='playlist-songs')

urlpatterns = [
    path('get-dominant-color/', color_extraction.get_dominant_color, name='get_dominant_color'),
    
    # Các URL mặc định từ router
    path('', include(router.urls)),

    # Playlists
    path('create_playlist/', PlaylistViewSet.as_view({'post': 'create_playlist'}), name='playlist-create'),
    path('change_playlist/<int:pk>/', PlaylistViewSet.as_view({'put': 'change_playlists'}), name='playlist-change'),
    path('delete_playlist/<int:pk>/', PlaylistViewSet.as_view({'delete': 'delete_playlists'}), name='playlist-delete'),

    # PlaylistSong
    path('playlist-songs/<int:playlistId>/', PlaylistSongViewSet.as_view({'get': 'retrieve'}), name='playlist-songs-list'),
    path('create-playlist-song/', PlaylistSongViewSet.as_view({'post': 'create_playlist_song'}), name='playlist-song-create'),
    path('change-playlist-song/<int:pk>/', PlaylistSongViewSet.as_view({'put': 'change_playlist_song'}), name='playlist-song-change'),
    path('delete-playlist-song/<int:pk>/', PlaylistSongViewSet.as_view({'delete': 'delete_playlist_song'}), name='playlist-song-delete'),
    path('users/<int:user_id>/playlists/', UserPlaylistListView.as_view(), name='user-playlists'),
]