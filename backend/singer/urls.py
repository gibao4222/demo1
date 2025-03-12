from django.urls import path
from . import views

urlpatterns = [
    path('singers/', views.singer_list, name='singer_list'),
]