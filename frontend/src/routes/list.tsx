import { memo, useCallback, useState } from 'react';
import { Params, redirect, useLoaderData, useOutletContext } from 'react-router-dom';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { CreateCategoryDialog } from '../components/CreateCategoryDialog';
import { CreateItemDialog } from '../components/CreateItemDialog';
import { ListType, CategoryType, getList, deleteCategory, moveItem, deleteItem, moveCategory, ItemType, updateCategory, addCategory, addItem, updateItem } from '../loaders';
import { SnackbarContextType } from './root';
import { closestCenter, CollisionDetection, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, getFirstCollision, pointerWithin, rectIntersection } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getDraggableData, getDraggableTransform, reorderElement, useReorderable } from '../hooks/useReorderable';
import { UpdateItemDialog } from '../components/UpdateItemDialog';
import { UpdateCategoryDialog } from '../components/UpdateCategoryDialog';
import classNames from 'classnames';

export async function loader({ params }: {params: Params<"listId">}) {
    if ( params.hasOwnProperty("listId") ) {
        const listId = Number(params.listId)
        if ( ! isNaN(listId) ) {
            const APIResponse = await getList(listId);
            if ( APIResponse.success ) {
                return APIResponse.data;
            } else {
                return redirect(`/?error=${APIResponse.error}`)
            }
        }
    }

    throw new Error("Unable to parse route param");
}

function SortableItem(props: ItemProps) {
    const item = props.item;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: item.id,
        data: getDraggableData(item, "Item")
    });
    
    return (
        <Box ref={setNodeRef} style={getDraggableTransform(transform, transition, isDragging)} {...listeners} {...attributes}>
            <Item {...props} />
        </Box>
    );
}

type ItemProps = {
    item: ItemType,
    updateItems: Function,
    deleteItems: Function,
    isDragOverlay?: boolean
}
const Item = memo(({item, updateItems, deleteItems, isDragOverlay = false}: ItemProps) => {
    const outletContext = useOutletContext() as SnackbarContextType;
    const [updateItemDialogOpen, setUpdateItemDialogOpen] = useState(false);
    const handleClickOpen = () => {
        setUpdateItemDialogOpen(true);
      };
      const handleClose = () => {
        setUpdateItemDialogOpen(false);
    };

    const handleUpdateItem = async (name: string) => {
        const APIResponse = await updateItem(item, name);
        if ( APIResponse.success ) {
            updateItems(APIResponse.data);
            handleClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleDeleteItem = async () => {
        const APIResponse = await deleteItem(item);
        if ( APIResponse.success ) {
            deleteItems(item);
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    return (
        <Box className={classNames('item-card', { 'dragging': isDragOverlay })}>
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <Box
                    sx={{flexGrow: 1}}
                    onClick={() => handleClickOpen()}>
                    <Typography component="div">{item.name}</Typography>
                </Box>
                <IconButton 
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    className="menu-button"
                    onClick={e => handleDeleteItem()}
                    ><DeleteIcon/>
                </IconButton>
            </Box>
            <UpdateItemDialog open={updateItemDialogOpen} handleClose={handleClose} handleUpdate={handleUpdateItem} item={item} />
        </Box>
    );
});

function SortableCategory(props: CategoryProps) {
    const category = props.category
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: category.id,
        data: getDraggableData(category, "Category")
    });

    return (
        <Box ref={setNodeRef} style={getDraggableTransform(transform, transition, isDragging)} {...listeners} {...attributes}>
            <Category {...props} />
        </Box>
    );
}

type CategoryProps = {
    category: CategoryType,
    allItems: Array<ItemType>,
    updateCategories: Function,
    deleteCategories: Function,
    createItems: Function,
    updateItems: Function,
    deleteItems: Function,
    isDragOverlay?: boolean
}
const Category = memo(({category, allItems, updateCategories, deleteCategories, createItems, updateItems, deleteItems, isDragOverlay = false}: CategoryProps) => {
    const outletContext = useOutletContext() as SnackbarContextType;
    const items = allItems.filter(item => item.category === category.id);
    const sortableItems = items.map(item =>
        <SortableItem key={item.id} item={item} updateItems={updateItems} deleteItems={deleteItems} />
    );
    
    const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
    const handleClickCreateItemOpen = () => {
        setCreateItemDialogOpen(true);
      };
      const handleClickCreateItemClose = () => {
        setCreateItemDialogOpen(false);
    };

    const [updateCategoryDialogOpen, setUpdateCategoryDialogOpen] = useState(false);
    const handleClickUpdateCategoryOpen = () => {
        setUpdateCategoryDialogOpen(true);
      };
      const handleClickUpdateCategoryClose = () => {
        setUpdateCategoryDialogOpen(false);
    };

    const handleUpdateCategory = async (name: string) => {
        const APIResponse = await updateCategory(category, name);
        if ( APIResponse.success ) {
            updateCategories(APIResponse.data);
            handleClickUpdateCategoryClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleClickDeleteCategory = async () => {
        const APIResponse = await deleteCategory(category);
        if ( APIResponse.success ) {
            deleteCategories(category);
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    };

    const handleCreateItem = async (name: string) => {
        const APIResponse = await addItem(category, name);
        if ( APIResponse.success ) {
            createItems(category, APIResponse.data);
            handleClickCreateItemClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    return (
        <Box className={classNames('category-container', { 'dragging dragging-category': isDragOverlay })}>
            <Box className="category-header" sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <Box sx={{flexGrow: 1}} onClick={() => handleClickUpdateCategoryOpen()}>
                    <Typography variant="h6" component="div">{category.name}</Typography>
                </Box>
                <IconButton 
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    className="menu-button"
                    onClick={e => handleClickDeleteCategory()}
                    ><DeleteIcon/>
                </IconButton>
            </Box>
            <UpdateCategoryDialog open={updateCategoryDialogOpen} handleClose={handleClickUpdateCategoryClose} handleUpdate={handleUpdateCategory} category={category} />
            <Box className="category-items">
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    {sortableItems}
                </SortableContext>
            </Box>
            <Box
                className="add-item-card"
                onClick={() => handleClickCreateItemOpen()}
            >
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{mr: 2}}
                    ><AddIcon/>
                </IconButton>
                <Typography component="div">Add Item...</Typography>
            </Box>
            <CreateItemDialog open={createItemDialogOpen} handleClose={handleClickCreateItemClose} handleCreate={handleCreateItem} />
        </Box>
    );
});

export function FancyList() {
    const list = useLoaderData() as ListType;
    const [items, setItems] = useState<ItemType[]>(list.items);
    const [activeItem, setActiveItem] = useState<ItemType | null>(null);
    const [categories, setCategories] = useState<CategoryType[]>(list.categories);
    const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
    const {draggableProps} = useReorderable();
    const outletContext = useOutletContext() as SnackbarContextType;
    
    const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false);
    const handleClickOpen = () => {
        setCreateCategoryDialogOpen(true);
      };
      const handleClose = () => {
        setCreateCategoryDialogOpen(false);
    };

    const handleCreateCategory = async (name: string) => {
        const APIResponse = await addCategory(list, name);
        if ( APIResponse.success ) {
            setCategories([...categories, APIResponse.data]);
            handleClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleUpdateCategories = useCallback((category: CategoryType) => {
        setCategories(categories.map(c => c.id === category.id ? category : c));
    }, [categories]);

    const handleDeleteCategories = useCallback((category: CategoryType) => {
        setCategories(categories.filter(c => c.id !== category.id));
    }, [categories]);

    const handleReorderCategory = async (movedCategory: CategoryType, overCategory: CategoryType) => {
        const oldElements = [...categories];
        setCategories(reorderElement(categories, movedCategory, overCategory));
        
        // calculate new display order based on the position of the category hovered over, as items
        // will not have updated yet
        const APIResponse = await moveCategory(movedCategory, categories.indexOf(overCategory));
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
            setCategories(oldElements);
        }
    }

    const handleCreateItems = (category: CategoryType, item: ItemType) => {
        setItems([...items, item]);
    };

    const handleUpdateItems = (item: ItemType) => {
        setItems(items.map(i => i.id === item.id ? item : i));
    };

    const handleDeleteItems = (item: ItemType) => {
        setItems(items.filter(i => i.id !== item.id));
    };

    const handleReorderItem = async (movedItem: ItemType, overItem: ItemType) => {
        const oldElements = [...items];
        setItems(reorderElement(items, movedItem, overItem));

        // calculate new display order based on the position of the item hovered over, as items
        // will not have updated yet
        const display_order = items.filter(item => item.category === overItem.category).indexOf(overItem);
        const APIResponse = await moveItem(movedItem, display_order);
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
            setItems(oldElements);
        }
    }

    // Droppable algorithms courtesy of
    // https://github.com/clauderic/dnd-kit/blob/master/stories/2%20-%20Presets/Sortable/MultipleContainers.tsx
    const categoryIds = categories.map(category => category.id);
    const collisionDetectionStrategy: CollisionDetection = useCallback(
        (args) => {
            // If dragging a category, only allow it to be dropped on top of another category
            if ( activeCategory ) {
                const filteredDroppables = args.droppableContainers.filter(
                    container => categoryIds.includes(Number(container.id))
                );

                return closestCenter({
                    ...args,
                    droppableContainers: filteredDroppables
                });
            }
    
            // Start by finding any intersecting droppable
            const pointerIntersections = pointerWithin(args);
            const intersections =
                pointerIntersections.length > 0
                ? // If there are droppables intersecting with the pointer, return those
                    pointerIntersections
                : rectIntersection(args);
            let overId = getFirstCollision(intersections, 'id');
    
            if (overId != null) {
                // If drop target is a category
                if (categoryIds.includes(Number(overId))) {
                    const category_items = items.filter(item => item.category === overId).map(item => item.id);
        
                    // If matching category contains items
                    if (category_items.length > 0) {
                        // Return the closest droppable within that container
                        overId = closestCenter({
                            ...args,
                            droppableContainers: args.droppableContainers.filter(
                                (container) =>
                                container.id !== overId &&
                                category_items.includes(Number(container.id))
                            ),
                        })[0]?.id;
                    }
                }
        
                return [{id: overId}];
            }

            return [];
        },
        [activeCategory, categoryIds, items]
    );

    const listCategories = categories.map(category => 
        <SortableCategory
            key={category.id}
            category={category}
            allItems={items}
            updateCategories={handleUpdateCategories}
            deleteCategories={handleDeleteCategories}
            createItems={handleCreateItems}
            updateItems={handleUpdateItems}
            deleteItems={handleDeleteItems} />
    );
    return (
        <DndContext
            collisionDetection={collisionDetectionStrategy}
            onDragStart={(event: DragStartEvent) => {
                const {active} = event;

                if ( ! active.data.current ) return;
                
                if ( active.data.current.type === "Item" ) {
                    setActiveItem(active.data.current.element);
                } else if ( active.data.current.type === "Category" ) {
                    setActiveCategory(active.data.current.element);
                }
            }}

            onDragEnd={(event: DragEndEvent) => {
                setActiveItem(null);
                setActiveCategory(null);
                
                const {active, over} = event;
                if ( ! active.data.current || ! over?.data.current ) {
                    return;
                }

                if ( active.data.current.type === "Item" ) {
                    handleReorderItem(active.data.current.element, over.data.current.element);
                } else if ( active.data.current.type === "Category" ) {
                    handleReorderCategory(active.data.current.element, over.data.current.element);
                }
            }}

            // handle case where an item is dragged between categories
            onDragOver={(event: DragOverEvent) => {
                const {active, over} = event;
                if ( ! active.data.current || ! over?.data.current ) {
                    return;
                }

                if ( active.data.current.type !== "Item" ) return;

                const current_item = active.data.current.element;
                const current_category = current_item.category;

                const new_category = over.data.current.type === "Category" ?
                    over.data.current.element.id :
                    over.data.current?.element.category;

                if ( ! new_category ) return;
                if ( current_category === new_category ) return;

                // if an item is being dragged, is hovered over a category, and the category
                // is not the item's parent, move the item to the new parent
                current_item.category = new_category;
                const newItems = items.map(item => {
                    return item.id === current_item.id ? current_item : item;
                })
                setItems(newItems);
            }}

            {...draggableProps}
        >
            <Box className="list-header">
                <Typography variant="h5" component="div">
                    {list.name}
                </Typography>
            </Box>
            <Box className="category-list">
                <SortableContext items={categories} strategy={horizontalListSortingStrategy}>
                    {listCategories}
                </SortableContext>
                <Box>
                    <Box className="category-container">
                        <Box className="category-header" sx={{display: "flex", alignItems: "center"}} onClick={() => handleClickOpen()}>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                sx={{mr: 2}}
                                ><AddIcon/>
                            </IconButton>
                            <Typography variant="h6" component="div">Add Category...</Typography>
                        </Box>
                        <CreateCategoryDialog open={createCategoryDialogOpen} handleClose={handleClose} handleCreate={handleCreateCategory} />
                    </Box>
                </Box>
            </Box>
            <DragOverlay>
                {activeCategory && <Category category={activeCategory} allItems={items} updateCategories={handleUpdateCategories} deleteCategories={handleDeleteCategories} createItems={handleCreateItems} updateItems={handleUpdateItems} deleteItems={handleDeleteItems} isDragOverlay={true} />}
                {activeItem && <Item item={activeItem} updateItems={handleUpdateItems} deleteItems={handleDeleteItems} isDragOverlay={true} />}
            </DragOverlay>
        </DndContext>
    );
}