from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SpotifyUserViewSet, UserAlbumViewSet, UserSingerViewSet
from .views.auth_views import LoginView,RegisterView, SocialLoginView, LoginPageView


router = DefaultRouter()
router.register(r'users', SpotifyUserViewSet)
router.register(r'user-albums', UserAlbumViewSet)
router.register(r'user-singers', UserSingerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('social-login/', SocialLoginView.as_view(), name='social-login'),
    path('login-page/', LoginPageView.as_view(), name='login-page'),
]