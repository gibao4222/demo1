from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.views import AlbumViewSet, AlbumSongViewSet, SingerAlbumViewSet

router = DefaultRouter()
router.register(r'albums', AlbumViewSet)
router.register(r'album-songs', AlbumSongViewSet)
router.register(r'singer-albums', SingerAlbumViewSet)

urlpatterns = [
    path('', include(router.urls)),
]