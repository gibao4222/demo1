from django.shortcuts import render
from django.http import HttpResponse

def singer_list(request):
    return HttpResponse("List of singers")
