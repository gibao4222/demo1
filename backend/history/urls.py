from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.views import HistoryViewSet
router = DefaultRouter()
router.register(r'histories', HistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('add-history/', HistoryViewSet.as_view({'post': 'add_song_history'}), name='add_history'),
]