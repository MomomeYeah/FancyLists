from django import forms

class ListForm(forms.Form):
    name = forms.CharField(max_length = 100, widget = forms.TextInput(attrs = {'placeholder': 'Enter a name for your list'}))

class CategoryForm(forms.Form):
    name = forms.CharField(max_length = 100, widget = forms.TextInput(attrs = {'placeholder': 'Enter a name for your category'}))

class ItemForm(forms.Form):
    name = forms.CharField(max_length = 100, widget = forms.TextInput(attrs = {'placeholder': 'Enter a name for your item'}))

class AddCategoryForm(forms.Form):
    category_id = forms.IntegerField()

class RemoveCategoryForm(forms.Form):
    list_id = forms.IntegerField()
    category_id = forms.IntegerField()