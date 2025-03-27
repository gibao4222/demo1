from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.views import GenreViewSet

router = DefaultRouter()
router.register(r'genres', GenreViewSet)

urlpatterns = [
    path('', include(router.urls)),
]