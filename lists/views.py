from django.shortcuts import render
from django.utils import timezone
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse

from lists.models import List, Category, Item
from lists.forms import ListForm, CategoryForm, ItemForm

def index(request):
    lists = List.objects.order_by('-created_date')[:1]
    latest_list = None
    if lists.count() > 0:
        latest_list = lists[0]
    return render(request, 'lists/index.html', {'latest_list': latest_list})

def new_list(request):
    if request.method == 'POST':
        form = ListForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            new_list = List.objects.create_list(cd['name'])
            new_list.save()
            return HttpResponseRedirect(reverse('lists:index'))
    else:
        form = ListForm()
    return render(request, 'lists/new.html', {'form': form})

def delete_list(request, list_id):
    if request.method == 'POST':
        delete_list = List.objects.filter(pk = list_id)
        if delete_list.count() == 1:
            delete_list.delete()
        return HttpResponseRedirect(reverse('lists:index'))
    else:
        lists = List.objects.filter(pk = list_id)
        if lists.count() == 1:
            return render(request, 'lists/delete.html', {'delete_list': lists[0]})
        return HttpResponseRedirect(reverse('lists:index'))
    return render(request, 'lists/new.html', {'form': form})

def new_category(request, list_id):
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            new_category = Category.objects.create_category(cd['name'], list_id)
            new_category.save()
            return HttpResponseRedirect(reverse('lists:index'))
    else:
        form = CategoryForm()
    return render(request, 'categories/new.html', {'form': form})

def delete_category(request, category_id):
    if request.method == 'POST':
        delete_category = Category.objects.filter(pk = category_id)
        if delete_category.count() == 1:
            delete_category.delete()
        return HttpResponseRedirect(reverse('lists:index'))
    else:
        categories = Category.objects.filter(pk = category_id)
        if categories.count() == 1:
            return render(request, 'categories/delete.html', {'delete_category': categories[0]})
        return HttpResponseRedirect(reverse('lists:index'))
    return render(request, 'categories/new.html', {'form': form})

def new_item(request, category_id):
    if request.method == 'POST':
        form = ItemForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            new_item = Item.objects.create_item(cd['name'], category_id)
            new_item.save()
            return HttpResponseRedirect(reverse('lists:index'))
    else:
        form = ItemForm()
    return render(request, 'items/new.html', {'form': form})

def delete_item(request, item_id):
    if request.method == 'POST':
        delete_item = Item.objects.filter(pk = item_id)
        if delete_item.count() == 1:
            delete_item.delete()
        return HttpResponseRedirect(reverse('lists:index'))
    else:
        items = Item.objects.filter(pk = item_id)
        if items.count() == 1:
            return render(request, 'items/delete.html', {'delete_item': items[0]})
        return HttpResponseRedirect(reverse('lists:index'))
    return render(request, 'items/new.html', {'form': form})