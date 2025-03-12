from django.shortcuts import render
from django.http import HttpResponse

def history_list(request):
    return HttpResponse("List of history")
