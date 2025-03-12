from django.shortcuts import render
from django.http import HttpResponse

def playlist_list(request):
    return HttpResponse("List of playlists")
