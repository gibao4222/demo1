from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SpotifyUserViewSet, UserAlbumViewSet, UserSingerViewSet
from .views.auth_views import LoginStep1View,LoginStep2View, RegisterView, LogoutView
from .views.facebook_login import FacebookLoginView
from .views.google_login import GoogleLoginView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', SpotifyUserViewSet)
router.register(r'user-albums', UserAlbumViewSet)
router.register(r'user-singers', UserSingerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/step1/', LoginStep1View.as_view(), name='login_step1'),
    path('login/step2/', LoginStep2View.as_view(), name='login_step2'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('auth/facebook/', FacebookLoginView.as_view(), name='facebook_login'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
]