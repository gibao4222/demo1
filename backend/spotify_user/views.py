from django.shortcuts import render
from django.http import HttpResponse

def spotify_user_list(request):
    return HttpResponse("List of Spotify users")
