import pytest
import random
import string

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient
  
  
@pytest.fixture(scope="function")
def api_client() -> APIClient:  
    """  
    Fixture to provide an API client  
    :return: APIClient  
    """  
    yield APIClient()

@pytest.fixture
def create_user():
    def create_user_fn():
        username = ''.join(random.choice(string.ascii_uppercase) for _ in range(10))
        user = User(username=username, is_superuser=True)
        user.save()
        token = Token.objects.create(user=user)

        return user, token.key
    
    return create_user_fn

class ReorderableManager(object):
    def __init__(self, api_client, api_path):
        self.api_client = api_client
        self.api_path = api_path

    def api_headers(self, token):
        return {
            "Authorization": f"Token {token}"
        }

    def get_list(self, token):
        return self.api_client.get(f"/api/{self.api_path}/", headers=self.api_headers(token))

    def get(self, token, id):
        return self.api_client.get(f"/api/{self.api_path}/{id}/", headers=self.api_headers(token))

    def create(self, token, **kwargs):
        data = {
            "name": ''.join(random.choice(string.ascii_uppercase) for _ in range(10))
        } | kwargs
        return self.api_client.post(f"/api/{self.api_path}/", headers=self.api_headers(token), data=data)

    def update(self, token, id, data):
        return self.api_client.patch(f"/api/{self.api_path}/{id}/", headers=self.api_headers(token), data=data)

    def delete(self, token, id):
        return self.api_client.delete(f"/api/{self.api_path}/{id}/", headers=self.api_headers(token))

class ListManager(ReorderableManager):
    def __init__(self, api_client):
        super().__init__(api_client, "lists")

@pytest.fixture
def list_manager(api_client):
    return ListManager(api_client)

class CategoryManager(ReorderableManager):
    def __init__(self, api_client):
        super().__init__(api_client, "categories")
        self.list_manager = ListManager(self.api_client)
        self.list_parent = None

    def create(self, token, **kwargs):
        if self.list_parent is None:
            self.list_parent = self.list_manager.create(token=token).json()

        list_parent = self.list_parent.get("id")
        if "parent_id" in kwargs:
            list_parent = kwargs["parent_id"]

        kwargs["list"] = list_parent
        return super().create(token, **kwargs)

@pytest.fixture
def category_manager(api_client):
    return CategoryManager(api_client)

class ItemManager(ReorderableManager):
    def __init__(self, api_client):
        super().__init__(api_client, "items")
        self.category_manager = CategoryManager(self.api_client)
        self.category_parent = None

    def create(self, token, **kwargs):
        if self.category_parent is None:
            self.category_parent = self.category_manager.create(token=token).json()

        category_parent = self.category_parent.get("id")
        if "parent_id" in kwargs:
            category_parent = kwargs["parent_id"]

        kwargs["category"] = category_parent
        return super().create(token, **kwargs)

@pytest.fixture
def item_manager(api_client):
    return ItemManager(api_client)
