from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.views import SingerViewSet, SingerSongViewSet

router = DefaultRouter()
router.register(r'singers', SingerViewSet)
router.register(r'singer-songs', SingerSongViewSet)

urlpatterns = [
    path('', include(router.urls)),
]