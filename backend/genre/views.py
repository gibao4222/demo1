from django.shortcuts import render
from django.http import HttpResponse

def genre_list(request):
    return HttpResponse("List of genres")
