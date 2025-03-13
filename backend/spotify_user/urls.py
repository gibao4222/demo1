from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.views import SpotifyUserViewSet, UserAlbumViewSet, UserSingerViewSet,LoginView


router = DefaultRouter()
router.register(r'users', SpotifyUserViewSet)
router.register(r'user-albums', UserAlbumViewSet)
router.register(r'user-singers', UserSingerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
]