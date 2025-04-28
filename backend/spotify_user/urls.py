from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.reset_vip import CheckVIPStatusView
from .views import  CurrentUserView, FollowArtistView, FollowersInfoView, SingerSearchView, SongSearchView, SpotifyUserViewSet, UserAlbumViewSet, UserSearchView, UserSingerViewSet, PlaylistSearchView, AlbumSearchView
from .views.auth_views import LoginStep1View,LoginStep2View, RegisterView, LogoutView
from .views.facebook_login import FacebookLoginView
from .views.google_login import GoogleLoginView
from .views import LikeSongView, FollowUserView
from rest_framework_simplejwt.views import TokenRefreshView


router = DefaultRouter()
router.register(r'users', SpotifyUserViewSet)
router.register(r'user-albums', UserAlbumViewSet)
router.register(r'user-singers', UserSingerViewSet)

urlpatterns = [
    path('users/search/', UserSearchView.as_view(), name='user-search'),
    path('', include(router.urls)),
    path('login/step1/', LoginStep1View.as_view(), name='login_step1'),
    path('login/step2/', LoginStep2View.as_view(), name='login_step2'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('auth/facebook/', FacebookLoginView.as_view(), name='facebook_login'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('thich-bai-hat/', LikeSongView.as_view(), name='thich-bai-hat'),
    path('theo-doi-nghe-si/', FollowArtistView.as_view(), name='followsinger'),
    path('theo-doi-nguoi-dung/', FollowUserView.as_view(), name='theo-doi-nguoi-dung'),
    path('songs/songs/', SongSearchView.as_view(), name='song-search'),
    path("current-user/", CurrentUserView.as_view(), name="current-user"),
    path('singers/search/', SingerSearchView.as_view(), name='singer-search'),
    path('playlists/playlists/', PlaylistSearchView.as_view(), name='playlist-search'),
    path('albums/search/', AlbumSearchView.as_view(), name='album-search'),
    path('check-vip/', CheckVIPStatusView.as_view(), name='check-vip'),
    path('users/<int:user_id>/followers-info/', FollowersInfoView.as_view(), name='followers-info'),


]
