from django import forms
from lists.models import FancyList, Category, Item

class ListForm(forms.ModelForm):
    class Meta:
        model = FancyList
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs = {'placeholder': 'Enter a name for your list'})
        }

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs = {'placeholder': 'Enter a name for your category'})
        }

class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs = {'placeholder': 'Enter a name for your item'})
        }

class AddCategoryForm(forms.Form):
    category_id = forms.IntegerField()

class ReorderCategoryForm(forms.Form):
    category_position = forms.IntegerField()

class AddItemForm(forms.Form):
    item_id = forms.IntegerField()

class ReorderItemForm(forms.Form):
    item_position = forms.IntegerField()
