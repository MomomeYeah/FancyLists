import pytest

@pytest.fixture
def create_users(fixture, request, create_user):
    user_authorized, token_authorized = create_user()
    user_unauthorized, token_unauthorized = create_user()
    
    return token_authorized, token_unauthorized

@pytest.mark.django_db
@pytest.mark.parametrize("fixture", ["list_manager", "category_manager", "item_manager"])
def test_get_list(fixture, request, create_users):
    token_authorized, token_unauthorized = create_users
    
    manager = request.getfixturevalue(fixture)
    object_id = manager.create(token=token_authorized).json().get("id")

    # test that user_unauthorized cannot access the object via list GET
    response = manager.get_list(token=token_unauthorized)
    assert response.status_code == 200
    object_ids = [list_element.get("id") for list_element in response.json()]
    assert object_id not in object_ids
    
    # test that user_authorized can access the object via list GET
    response = manager.get_list(token=token_authorized)
    assert response.status_code == 200
    object_ids = [list_element.get("id") for list_element in response.json()]
    assert object_id in object_ids

@pytest.mark.django_db
@pytest.mark.parametrize("fixture", ["list_manager", "category_manager", "item_manager"])
def test_get(fixture, request, create_users):
    token_authorized, token_unauthorized = create_users
    
    manager = request.getfixturevalue(fixture)
    object_id = manager.create(token=token_authorized).json().get("id")

    # test that user_unauthorized cannot access the object via GET
    response = manager.get(token=token_unauthorized, id=object_id)
    assert response.status_code == 403
    assert response.json().get("detail") == "You do not have permission to perform this action."
    
    # test that user_authorized can access the object via GET
    response = manager.get(token=token_authorized, id=object_id)
    assert response.status_code == 200
    assert object_id == response.json().get("id")

@pytest.mark.django_db
@pytest.mark.parametrize("fixture", ["list_manager", "category_manager", "item_manager"])
def test_update(fixture, request, create_users):
    token_authorized, token_unauthorized = create_users
    
    manager = request.getfixturevalue(fixture)
    object_id = manager.create(token=token_authorized).json().get("id")

    # test that user_unauthorized cannot update the object
    response = manager.update(token=token_unauthorized, id=object_id, data={})
    assert response.status_code == 403
    assert response.json().get("detail") == "You do not have permission to perform this action."

    # test that user_authorized can update the object
    response = manager.update(token=token_authorized, id=object_id, data={})
    assert response.status_code == 200
    assert object_id == response.json().get("id")

@pytest.mark.django_db
@pytest.mark.parametrize("fixture", ["list_manager", "category_manager", "item_manager"])
def test_delete(fixture, request, create_users):
    token_authorized, token_unauthorized = create_users
    
    manager = request.getfixturevalue(fixture)
    object_id = manager.create(token=token_authorized).json().get("id")

    # test that user_unauthorized cannot delete the object
    response = manager.delete(token=token_unauthorized, id=object_id)
    assert response.status_code == 403
    assert response.json().get("detail") == "You do not have permission to perform this action."
    
    # test that user_authorized can delete the object
    response = manager.delete(token=token_authorized, id=object_id)
    assert response.status_code == 204
    assert response.data is None