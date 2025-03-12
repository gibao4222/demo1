from django.urls import path
from . import views

urlpatterns = [
    path('history/', views.history_list, name='history_list'),
]