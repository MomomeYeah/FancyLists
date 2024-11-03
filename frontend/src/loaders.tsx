// TODO: use proper typing here, return values, etc.

export async function makeAPIRequest(URL: string, method: string, body?: string) {
    let userData = window.localStorage.getItem('user');
    if ( ! userData ) {
        userData = JSON.stringify({
            key: ''
        });
    }

    const token = JSON.parse(userData).key;
    const response = await fetch(URL, {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: body
    });

    if ( [200, 201].includes(response.status) ) {
        return response.json();
    }
    return null;
}

export type ListType = {
    id: number,
    name: string,
    created_date: string,
    display_order: number,
    category_set: Array<number>,
    categories: Array<CategoryType>
}
export async function getLists(): Promise<Array<ListType>> {
    const listsURL = "http://localhost:8000/api/lists";
    return await makeAPIRequest(listsURL, 'GET');
}
export async function getList(listId: number): Promise<ListType> {
    const listURL = `http://localhost:8000/api/lists/${listId}`;
    const list = await makeAPIRequest(listURL, 'GET') as ListType;

    list.categories = await Promise.all(
        list.category_set.map(async (category) => await getCategory(category))
    );

    return list;
}
export async function addList(name: string): Promise<void> {
    const listURL = `http://localhost:8000/api/lists/`;
    await makeAPIRequest(listURL, 'POST', JSON.stringify({
        name: name
    }));
}
export async function deleteList(listId: number): Promise<void> {
    const listURL = `http://localhost:8000/api/lists/${listId}/`;
    await makeAPIRequest(listURL, 'DELETE');
}

export type CategoryType = {
    id: number,
    name: string,
    display_order: number,
    item_set: Array<number>,
    items: Array<ItemType>
}
export async function getCategory(categoryId: number): Promise<CategoryType> {
    const categoryURL = `http://localhost:8000/api/categories/${categoryId}`;
    const category = await makeAPIRequest(categoryURL, 'GET') as CategoryType;

    category.items = await Promise.all(
        category.item_set.map(async (item) => await getItem(item))
    );

    return category;
}
export async function addCategory(listId: number, name: string): Promise<void> {
    const categoryURL = `http://localhost:8000/api/categories/`;
    await makeAPIRequest(categoryURL, 'POST', JSON.stringify({
        list: listId,
        name: name
    }));
}
export async function deleteCategory(categoryId: number): Promise<void> {
    const categoryURL = `http://localhost:8000/api/categories/${categoryId}/`;
    await makeAPIRequest(categoryURL, 'DELETE');
}

// TODO: probably better to just get item names from category detail
export type ItemType = {
    id: number,
    name: string,
    display_order: number
}
export async function getItem(itemId: number): Promise<ItemType> {
    const itemURL = `http://localhost:8000/api/items/${itemId}`;
    return await makeAPIRequest(itemURL, 'GET');
}
export async function addItem(categoryId: number, name: string): Promise<void> {
    const itemURL = `http://localhost:8000/api/items/`;
    await makeAPIRequest(itemURL, 'POST', JSON.stringify({
        category: categoryId,
        name: name
    }));
}
export async function deleteItem(itemId: number): Promise<void> {
    const itemURL = `http://localhost:8000/api/items/${itemId}/`;
    await makeAPIRequest(itemURL, 'DELETE');
}