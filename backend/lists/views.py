from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from . ajax import *

from lists.models import FancyList, Category, FancyListCategory, Item, FancyListCategoryItem
from lists.forms import ListForm, CategoryForm, ItemForm, AddCategoryForm, ReorderCategoryForm, AddItemForm, ReorderItemForm

@login_required
def index_add_category(request, list_id):
    if request.method == 'POST':
        try:
            form = AddCategoryForm(request.POST)
            if form.is_valid():
                cd = form.cleaned_data
                category_id = cd['category_id']
                add_list = get_object_or_404(FancyList, pk = list_id)
                add_category = get_object_or_404(Category, pk = category_id)
                fancylistcategory = FancyListCategory.objects.create_list_category(add_list, add_category)

                all_items = []
                for item in Item.objects.all().order_by('name'):
                    all_items.append({'id': item.id, 'name': item.name})

                categorydict = render_to_dict(request, 'lists/fancylistcategory.html', {'fancylistcategory': fancylistcategory, 'all_items': all_items})
                return success_response(request=request, message=(u'Category added successfully'), data=categorydict, html_update_method='APPEND')
            else:
                return failure_response(request=request, message=(u'Invalid form'))
        except:
            return failure_response(request=request, message=(u'Could not add category.'))
    return failure_response(request=request, message=(u'Request method must be POST'))

@login_required
def index_remove_category(request, list_category_id):
    if request.method == 'POST':
        try:
            list_category = get_object_or_404(FancyListCategory, pk = list_category_id)
            fancylist = list_category.FancyList
            list_category.delete()
            fancylist.reorder_list_categories()
            return success_response(request=request, message=(u'Category removed successfully'), html_update_method='REMOVE')
        except:
            return failure_response(request=request, message=(u'Could not remove category'))
    return failure_response(request=request, message=(u'Request method must be POST'))

@login_required
def index_reorder_category(request, list_category_id):
    if request.method == 'POST':
        try:
            form = ReorderCategoryForm(request.POST)
            if form.is_valid():
                cd = form.cleaned_data
                category_position = cd['category_position']
                if category_position != None:
                    reorder_category = get_object_or_404(FancyListCategory, pk = list_category_id)
                    category_original_position = reorder_category.display_order
                    min_category_position = min(category_position, category_original_position)
                    max_category_position = max(category_position, category_original_position)
                    list_categories = FancyListCategory.objects.filter(FancyList = reorder_category.FancyList, display_order__gte = min_category_position, display_order__lte = max_category_position)
                    for list_category in list_categories:
                        if category_position < category_original_position:
                            list_category.increment_display_order()
                        elif category_position > category_original_position:
                            list_category.decrement_display_order()
                    reorder_category.set_display_order(category_position)
                    return success_response(request=request, message=(u'Category reordered successfully'))
                else:
                    return failure_response(request=request, message=(u'Could not find category position'))
            else:
                return failure_response(request=request, message=(u'Invalid form'))
        except:
            return failure_response(request=request, message=(u'Could not reorder category'))
    return failure_response(request=request, message=(u'Request method must be POST'))

@login_required
def index_add_item(request, list_category_id):
    if request.method == 'POST':
        try:
            form = AddItemForm(request.POST)
            if form.is_valid():
                cd = form.cleaned_data
                item_id = cd['item_id']
                add_list_category = get_object_or_404(FancyListCategory, pk = list_category_id)
                add_item = get_object_or_404(Item, pk = item_id)
                fancylistcategoryitem = FancyListCategoryItem.objects.create_list_category_item(add_list_category, add_item)
                itemdict = render_to_dict(request, 'lists/fancylistcategoryitem.html', {'fancylistcategoryitem': fancylistcategoryitem})
                return success_response(request=request, message=(u'Item added successfully'), data=itemdict, html_update_method='APPEND')
            else:
                return failure_response(request=request, message=(u'Invalid form'))
        except:
            return failure_response(request=request, message=(u'Could not add item.'))
    return failure_response(request=request, message=(u'Request method must be POST'))

@login_required
def index_remove_item(request, list_category_item_id):
    if request.method == 'POST':
        try:
            list_category_item = get_object_or_404(FancyListCategoryItem, pk = list_category_item_id)
            list_category = list_category_item.FancyListCategory
            list_category_item.delete()
            list_category.reorder_items()
            return success_response(request=request, message=(u'Item removed successfully'), html_update_method='REMOVE')
        except:
            return failure_response(request=request, message=(u'Could not remove item'))
    return failure_response(request=request, message=(u'Request method must be POST'))

@login_required
def index_reorder_item(request, list_category_item_id):
    if request.method == 'POST':
        try:
            form = ReorderItemForm(request.POST)
            if form.is_valid():
                cd = form.cleaned_data
                item_position = cd['item_position']
                if item_position != None:
                    reorder_item = get_object_or_404(FancyListCategoryItem, pk = list_category_item_id)
                    item_original_position = reorder_item.display_order
                    min_item_position = min(item_position, item_original_position)
                    max_item_position = max(item_position, item_original_position)
                    list_category_items = FancyListCategoryItem.objects.filter(FancyListCategory = reorder_item.FancyListCategory, display_order__gte = min_item_position, display_order__lte = max_item_position)
                    for list_category_item in list_category_items:
                        if item_position < item_original_position:
                            list_category_item.increment_display_order()
                        elif item_position > item_original_position:
                            list_category_item.decrement_display_order()
                    reorder_item.set_display_order(item_position)
                    return success_response(request=request, message=(u'Item reordered successfully'))
                else:
                    return failure_response(request=request, message=(u'Could not find item position'))
            else:
                return failure_response(request=request, message=(u'Invalid form'))
        except:
            return failure_response(request=request, message=(u'Could not reorder item'))
    return failure_response(request=request, message=(u'Request method must be POST'))

@login_required
def list_index(request):
    lists = FancyList.objects.filter(created_by = request.user).order_by('-created_date')
    return render(request, 'lists/list_index.html', {'indexitems': lists})

@login_required
def new_list(request):
    if request.method == 'POST':
        form = ListForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            fancylist = FancyList.objects.create_list(cd['name'], request.user)
            return HttpResponseRedirect(reverse('lists:edit_list', args = (fancylist.id,)))
    else:
        form = ListForm()
    return render(request, 'lists/new.html', {'form': form})

@login_required
def edit_list(request, list_id):
    fancylist = get_object_or_404(FancyList, pk = list_id)
    all_categories = []
    all_items = []
    for category in Category.objects.all().order_by('name'):
        all_categories.append({'id': category.id, 'name': category.name})
    for item in Item.objects.all().order_by('name'):
        all_items.append({'id': item.id, 'name': item.name})
    return render(request, 'lists/edit.html', {'fancylist': fancylist, 'all_categories': all_categories, 'all_items': all_items})

@login_required
def edit_list_name(request, list_id):
    fancylist = get_object_or_404(FancyList, pk = list_id)
    if request.method == 'POST':
        form = ListForm(request.POST, instance = fancylist)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('lists:edit_list', args = (list_id,)))
    else:
        form = ListForm(instance = fancylist)
    return render(request, 'lists/editname.html', {'edit_list_id': fancylist.id, 'form': form})

@login_required
def duplicate_list(request, list_id):
    fancylist = get_object_or_404(FancyList, pk = list_id)
    if request.method == 'POST':
        form = ListForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            fancylist_new = FancyList.objects.duplicate_list(cd['name'], fancylist)
            return HttpResponseRedirect(reverse('lists:edit_list', args = (fancylist_new.id,)))
    else:
        form = ListForm()
    return render(request, 'lists/new.html', {'form': form})

@login_required
def delete_list(request, list_id):
    fancylist = get_object_or_404(FancyList, pk = list_id)
    if request.method == 'POST':
        fancylist.delete()
        return HttpResponseRedirect(reverse('lists:list_index'))
    else:
        return render(request, 'lists/delete.html', {'delete_list': fancylist})

@login_required
def category_index(request):
    categories = Category.objects.order_by('name')
    return render(request, 'categories/index.html', {'indexitems': categories})

@login_required
def new_category(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            Category.objects.create_category(cd['name'])
            return HttpResponseRedirect(reverse('lists:category_index'))
    else:
        form = CategoryForm()
    return render(request, 'categories/new.html', {'form': form})

@login_required
def edit_category(request, category_id):
    category = get_object_or_404(Category, pk = category_id)
    if request.method == 'POST':
        form = CategoryForm(request.POST, instance = category)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('lists:category_index'))
    else:
        form = CategoryForm(instance = category)
    return render(request, 'categories/edit.html', {'edit_category': category, 'form': form})

@login_required
def delete_category(request, category_id):
    category = get_object_or_404(Category, pk = category_id)
    if request.method == 'POST':
        category.delete()
        return HttpResponseRedirect(reverse('lists:category_index'))
    else:
        return render(request, 'categories/delete.html', {'delete_category': category})

@login_required
def item_index(request):
    items = Item.objects.order_by('name')
    return render(request, 'items/index.html', {'indexitems': items})

@login_required
def new_item(request):
    if request.method == 'POST':
        form = ItemForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            Item.objects.create_item(cd['name'])
            return HttpResponseRedirect(reverse('lists:item_index'))
    else:
        form = ItemForm()
    return render(request, 'items/new.html', {'form': form})

@login_required
def edit_item(request, item_id):
    item = get_object_or_404(Item, pk = item_id)
    if request.method == 'POST':
        form = ItemForm(request.POST, instance = item)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('lists:item_index'))
    else:
        form = ItemForm(instance = item)
    return render(request, 'items/edit.html', {'edit_item': item, 'form': form})

@login_required
def delete_item(request, item_id):
    item = get_object_or_404(Item, pk = item_id)
    if request.method == 'POST':
        item.delete()
        return HttpResponseRedirect(reverse('lists:item_index'))
    else:
        return render(request, 'items/delete.html', {'delete_item': item})
