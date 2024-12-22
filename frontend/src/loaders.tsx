const AUTH_URL = "http://localhost:8000/auth";
const API_URL = "http://localhost:8000/api";

type APISuccessResponse<T> = {
    success: true,
    data: T
}
type APIErrorResponse = {
    success: false,
    error: string
}
export type APIResponse<T> = 
    | APISuccessResponse<T>
    | APIErrorResponse;
async function makeAPIRequest<T>(URL: string, method: string, body?: string): Promise<APIResponse<T>> {
    const successResponse = (data: any): APIResponse<T> => {
        return {success: true, data: data};
    }
    const errorResponse = (error: string): APIResponse<T> => {
        return {success: false, error: error};
    }

    const headers: {Accept: string, 'Content-Type': string, Authorization?: string } = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
    const userData = window.localStorage.getItem('user');
    if ( userData ) {
        headers['Authorization'] = `Token ${JSON.parse(userData).key}`;
    }
    try {
        const response = await fetch(URL, {
            method: method,
            headers: headers,
            body: body
        });
        if ( ! response.ok ) {
            try {
                const errorData = await response.json();
                if ( 'detail' in errorData ) {
                    // e.g attempting to access a list you don't own
                    return errorResponse(errorData['detail']);
                } else if ( 'non_field_errors' in errorData ) {
                    // e.g. bad login credentials
                    return errorResponse(errorData['non_field_errors']);    
                } else {
                    return errorResponse(response.statusText);    
                }
            }
            catch (e) {
                return errorResponse(response.statusText);
            }
        }
    
        if ( [200, 201].includes(response.status) ) {
            const success = await response.json();
            return successResponse(success);
        } else if ( response.status === 204 ) {
            return successResponse(null);
        } else {
            console.error(`Unknown error: ${response}`);
            return errorResponse("Unknown error");
        }
    }
    catch (error) {
        if ( typeof error === 'string' ) {
            return errorResponse(error);
        } else if ( error instanceof Error ) {
            // e.g. failed to fetch
            return errorResponse(error.message);
        } else {
            console.log(error);
            return errorResponse("");
        }
    }
}

export async function login(username: string, password: string): Promise<APIResponse<void>> {
    const loginURL = `${AUTH_URL}/login/`;
    return await makeAPIRequest(loginURL, 'POST', JSON.stringify({
        username: username,
        password: password
    }));
}
export async function register(username: string, password: string): Promise<APIResponse<void>> {
    const registrationURL = `${AUTH_URL}/registration/`;
    return await makeAPIRequest(registrationURL, 'POST', JSON.stringify({
        username: username,
        password1: password,
        password2: password
    }));
}

export interface Reorderable {
    id: number,
    display_order: number
}
export interface ListType extends Reorderable {
    name: string,
    created_date: string,
    owner: string,
    categories: Array<CategoryType>,
    items: Array<ItemType>
}
export async function getLists(): Promise<APIResponse<Array<ListType>>> {
    const listsURL = `${API_URL}/lists`;
    return await makeAPIRequest(listsURL, 'GET');
}
export async function getList(listId: number): Promise<APIResponse<ListType>> {
    const listURL = `${API_URL}/lists/${listId}`;
    return await makeAPIRequest(listURL, 'GET');
}
export async function addList(name: string): Promise<APIResponse<ListType>> {
    const listURL = `${API_URL}/lists/`;
    return await makeAPIRequest(listURL, 'POST', JSON.stringify({
        name: name
    }));
}
export async function updateList(list: ListType, name: string): Promise<APIResponse<ListType>> {
    const listURL = `${API_URL}/lists/${list.id}/`;
    return await makeAPIRequest(listURL, 'PATCH', JSON.stringify({
        name: name
    }));
}
export async function moveList(list: ListType, display_order: number): Promise<APIResponse<ListType>> {
    const listURL = `${API_URL}/lists/${list.id}/`;
    return await makeAPIRequest(listURL, 'PATCH', JSON.stringify({
        display_order: display_order
    }));
}
export async function deleteList(list: ListType): Promise<APIResponse<void>> {
    const listURL = `${API_URL}/lists/${list.id}/`;
    return await makeAPIRequest(listURL, 'DELETE');
}

export interface CategoryType extends Reorderable {
    name: string,
    list: number,
    items: Array<ItemType>
}
export async function addCategory(list: ListType, name: string): Promise<APIResponse<CategoryType>> {
    const categoryURL = `${API_URL}/categories/`;
    return await makeAPIRequest(categoryURL, 'POST', JSON.stringify({
        list: list.id,
        name: name
    }));
}
export async function updateCategory(category: CategoryType, name: string): Promise<APIResponse<CategoryType>> {
    const categoryURL = `${API_URL}/categories/${category.id}/`;
    return await makeAPIRequest(categoryURL, 'PATCH', JSON.stringify({
        name: name
    }));
}
export async function moveCategory(category: CategoryType, display_order: number): Promise<APIResponse<CategoryType>> {
    const categoryURL = `${API_URL}/categories/${category.id}/`;
    return await makeAPIRequest(categoryURL, 'PATCH', JSON.stringify({
        display_order: display_order
    }));
}
export async function deleteCategory(category: CategoryType): Promise<APIResponse<void>> {
    const categoryURL = `${API_URL}/categories/${category.id}/`;
    return await makeAPIRequest(categoryURL, 'DELETE');
}

export interface ItemType extends Reorderable {
    name: string,
    category: number
}
export async function addItem(category: CategoryType, name: string): Promise<APIResponse<ItemType>> {
    const itemURL = `${API_URL}/items/`;
    return await makeAPIRequest(itemURL, 'POST', JSON.stringify({
        category: category.id,
        name: name
    }));
}
export async function updateItem(item: ItemType, name: string): Promise<APIResponse<ItemType>> {
    const itemURL = `${API_URL}/items/${item.id}/`;
    return await makeAPIRequest(itemURL, 'PATCH', JSON.stringify({
        name: name
    }));
}
export async function moveItem(item: ItemType, display_order: number): Promise<APIResponse<ItemType>> {
    const itemURL = `${API_URL}/items/${item.id}/`;
    return await makeAPIRequest(itemURL, 'PATCH', JSON.stringify({
        category: item.category,
        display_order: display_order
    }));
}
export async function deleteItem(item: ItemType): Promise<APIResponse<void>> {
    const itemURL = `${API_URL}/items/${item.id}/`;
    return await makeAPIRequest(itemURL, 'DELETE');
}