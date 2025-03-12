from django.shortcuts import render
from django.http import HttpResponse

def album_list(request):
    return HttpResponse("List of albums")