from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SongViewSet

router = DefaultRouter()
router.register(r'songs', SongViewSet, basename='songs')

urlpatterns = [
    path('', include(router.urls)),
    path('create-song/', SongViewSet.as_view({'post': 'create_song'}), name='song-create'),
    path('change-song/<int:pk>/', SongViewSet.as_view({'put': 'change_song'}), name='song-change'),
    path('delete-song/<int:pk>/', SongViewSet.as_view({'delete': 'delete_song'}), name='song-delete'),
]