import pytest

@pytest.mark.django_db
def test_list_increment_on_create(create_user, list_manager):
    user1, token1 = create_user()
    user2, token2 = create_user()

    # create first list, and check that display_order starts from 1
    response = list_manager.create(token=token1)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 1

    # create second list, and check that display_order increments
    response = list_manager.create(token=token1)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 2

    # create list as alternate user, and check that display_order starts from 1
    response = list_manager.create(token=token2)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 1

@pytest.mark.django_db
def test_category_increment_on_create(create_user, list_manager, category_manager):
    user1, token1 = create_user()
    user2, token2 = create_user()

    # create first category, and check that display_order starts from 1
    response = category_manager.create(token=token1)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 1

    # create second category, and check that display_order increments
    response = category_manager.create(token=token1)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 2

    # create a category under a separate list, and check that display_order starts from 1
    response = list_manager.create(token=token1)
    assert response.status_code == 201
    new_list_id = response.json().get("id")
    response = category_manager.create(token=token1, parent_id=new_list_id)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 1

    # create a second category under the new parent list, and check that display_order increments
    response = category_manager.create(token=token1, parent_id=new_list_id)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 2

    # create category as alternate user, and check that display_order starts from 1
    response = list_manager.create(token=token2)
    assert response.status_code == 201
    new_list_id2 = response.json().get("id")
    response = category_manager.create(token=token2, parent_id=new_list_id2)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 1

@pytest.mark.django_db
def test_item_increment_on_create(create_user, list_manager, category_manager, item_manager):
    user1, token1 = create_user()
    user2, token2 = create_user()

    # create first item, and check that display_order starts from 1
    response = item_manager.create(token=token1)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 1

    # create second item, and check that display_order increments
    response = item_manager.create(token=token1)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 2

    # create an item under a separate category, and check that display_order starts from 1
    response = category_manager.create(token=token1)
    assert response.status_code == 201
    new_category_id = response.json().get("id")
    response = item_manager.create(token=token1, parent_id=new_category_id)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 1

    # create a second item under the new parent category, and check that display_order increments
    response = item_manager.create(token=token1, parent_id=new_category_id)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 2

    # create item as alternate user, and check that display_order starts from 1
    response = list_manager.create(token=token2)
    assert response.status_code == 201
    new_list_id2 = response.json().get("id")
    response = category_manager.create(token=token2, parent_id=new_list_id2)
    assert response.status_code == 201
    new_category_id2 = response.json().get("id")
    response = item_manager.create(token=token2, parent_id=new_category_id2)
    assert response.status_code == 201
    assert "display_order" in response.json()
    assert response.json().get("display_order") == 1

@pytest.fixture
def get_test_objects(create_user):
    def get_test_objects_fn(manager):
        user, token = create_user()

        # create first object, and check that display_order starts from 1
        response = manager.create(token=token)
        assert response.status_code == 201
        list_id1 = response.json().get("id")
        assert response.json().get("display_order") == 1

        # create second object, and check that display_order increments
        response = manager.create(token=token)
        assert response.status_code == 201
        list_id2 = response.json().get("id")
        assert response.json().get("display_order") == 2

        # create third object, and check that display_order increments
        response = manager.create(token=token)
        assert response.status_code == 201
        list_id3 = response.json().get("id")
        assert response.json().get("display_order") == 3

        return token, list_id1, list_id2, list_id3
    
    return get_test_objects_fn
 
@pytest.mark.django_db
@pytest.mark.parametrize("fixture", ["list_manager", "category_manager", "item_manager"])
def test_decrement_on_delete(fixture, request, get_test_objects):
    manager = request.getfixturevalue(fixture)
    token, obj_id1, obj_id2, obj_id3 = get_test_objects(manager)

    # delete first object
    response = manager.delete(token=token, id=obj_id1)
    assert response.status_code == 204

    # check that display_order decrements for first two lists
    response = manager.get(token=token, id=obj_id2)
    assert response.status_code == 200
    assert response.json().get("display_order") == 1

    response = manager.get(token=token, id=obj_id3)
    assert response.status_code == 200
    assert response.json().get("display_order") == 2

@pytest.mark.django_db
@pytest.mark.parametrize("fixture", ["list_manager", "category_manager", "item_manager"])
def test_reorder_upwards(fixture, request, get_test_objects):
    manager = request.getfixturevalue(fixture)
    token, obj_id1, obj_id2, obj_id3 = get_test_objects(manager)

    # update display_order of object 3 to position 2
    response = manager.update(token=token, id=obj_id3, data={"display_order": 2})
    assert response.status_code == 200
    assert response.json().get("display_order") == 2

    # check that display_order is unchanged for object 1
    response = manager.get(token=token, id=obj_id1)
    assert response.status_code == 200
    assert response.json().get("display_order") == 1
 
    # check that display_order increments for object 2
    response = manager.get(token=token, id=obj_id2)
    assert response.status_code == 200
    assert response.json().get("display_order") == 3

@pytest.mark.django_db
@pytest.mark.parametrize("fixture", ["list_manager", "category_manager", "item_manager"])
def test_reorder_downwards(fixture, request, get_test_objects):
    manager = request.getfixturevalue(fixture)
    token, obj_id1, obj_id2, obj_id3 = get_test_objects(manager)

    # update display_order of object 1 to position 2
    response = manager.update(token=token, id=obj_id1, data={"display_order": 2})
    assert response.status_code == 200
    assert response.json().get("display_order") == 2

    # check that display_order decrements for object 2
    response = manager.get(token=token, id=obj_id2)
    assert response.status_code == 200
    assert response.json().get("display_order") == 1
 
    # check that display_order increments for object 3
    response = manager.get(token=token, id=obj_id3)
    assert response.status_code == 200
    assert response.json().get("display_order") == 3
