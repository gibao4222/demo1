from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.views import PlaylistViewSet, PlaylistSongViewSet

router = DefaultRouter()
router.register(r'playlists', PlaylistViewSet)
router.register(r'playlist-songs', PlaylistSongViewSet)

urlpatterns = [
    path('', include(router.urls)),
]