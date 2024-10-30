// TODO: use proper typing here, return values, etc.

export type ListType = {
    id: number,
    name: string,
    created_date: string,
    display_order: number,
    category_set: Array<number>,
    categories: Array<CategoryType>
}
export async function getLists(): Promise<Array<ListType>> {
    const APIURL = "http://localhost:8000/api/lists";
    const lists = await fetch(APIURL);
    return lists.json();
}
export async function getList(listId: number): Promise<ListType> {
    const listURL = `http://localhost:8000/api/lists/${listId}`;
    const listRaw = await fetch(listURL);
    const list = await listRaw.json() as ListType;

    list.categories = await Promise.all(
        list.category_set.map(async (category) => await getCategory(category))
    );

    return list;
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
    const categoryRaw = await fetch(categoryURL);
    const category = await categoryRaw.json() as CategoryType;

    category.items = await Promise.all(
        category.item_set.map(async (item) => await getItem(item))
    );

    return category;
}

// TODO: probably better to just get item names from category detail
export type ItemType = {
    id: number,
    name: string,
    display_order: number
}
export async function getItem(itemId: number): Promise<ItemType> {
    const itemURL = `http://localhost:8000/api/items/${itemId}`;
    const itemRaw = await fetch(itemURL);
    return itemRaw.json();
}