from django.shortcuts import render
from django.utils import timezone

def base(request):
    # return render(request, 'FancyLists/base.html', {'current_date': timezone.now()})
    return render(request, 'lists/main.html', {'current_date': timezone.now()})