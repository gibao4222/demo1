from django.shortcuts import render
from django.http import HttpResponse

def song_list(request):
    return HttpResponse("List of songs")
