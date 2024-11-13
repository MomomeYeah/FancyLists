const AUTH_URL = "http://localhost:8000/auth/login/";
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
    return await makeAPIRequest(AUTH_URL, 'POST', JSON.stringify({
        username: username,
        password: password
    }));
}

export type ListType = {
    id: number,
    name: string,
    created_date: string,
    owner: string,
    display_order: number,
    categories: Array<CategoryType>
}
export async function getLists(): Promise<APIResponse<Array<ListType>>> {
    const listsURL = `${API_URL}/lists`;
    return await makeAPIRequest(listsURL, 'GET');
}
export async function getList(listId: number): Promise<APIResponse<ListType>> {
    const listURL = `${API_URL}/lists/${listId}`;
    return await makeAPIRequest(listURL, 'GET');
}
export async function addList(name: string): Promise<APIResponse<void>> {
    const listURL = `${API_URL}/lists/`;
    return await makeAPIRequest(listURL, 'POST', JSON.stringify({
        name: name
    }));
}
export async function deleteList(listId: number): Promise<APIResponse<void>> {
    const listURL = `${API_URL}/lists/${listId}/`;
    return await makeAPIRequest(listURL, 'DELETE');
}

export type CategoryType = {
    id: number,
    name: string,
    list: number,
    display_order: number,
    items: Array<ItemType>
}
export async function addCategory(listId: number, name: string): Promise<APIResponse<void>> {
    const categoryURL = `${API_URL}/categories/`;
    return await makeAPIRequest(categoryURL, 'POST', JSON.stringify({
        list: listId,
        name: name
    }));
}
export async function deleteCategory(categoryId: number): Promise<APIResponse<void>> {
    const categoryURL = `${API_URL}/categories/${categoryId}/`;
    return await makeAPIRequest(categoryURL, 'DELETE');
}

export type ItemType = {
    id: number,
    name: string,
    category: number,
    display_order: number
}
export async function addItem(categoryId: number, name: string): Promise<APIResponse<void>> {
    const itemURL = `${API_URL}/items/`;
    return await makeAPIRequest(itemURL, 'POST', JSON.stringify({
        category: categoryId,
        name: name
    }));
}
export async function deleteItem(itemId: number): Promise<APIResponse<void>> {
    const itemURL = `${API_URL}/items/${itemId}/`;
    return await makeAPIRequest(itemURL, 'DELETE');
}