import React, { useState } from 'react';
import { Params, redirect, useLoaderData, useOutletContext } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { CreateCategoryDialog } from '../components/CreateCategoryDialog';
import { CreateItemDialog } from '../components/CreateItemDialog';
import { ListType, CategoryType, getList, deleteCategory, moveItem, deleteItem, moveCategory, ItemType, updateCategory, addCategory, addItem, updateItem } from '../loaders';
import { SnackbarContextType } from './root';
import './list.css';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getDraggableData, getDraggableTransform, ReorderableUtils, useReorderable } from '../hooks/useReorderable';
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

function SortableItem({item, reorderableUtils}: ItemProps) {
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
            <Item item={item} reorderableUtils={reorderableUtils} />
        </Box>
    );
}

type ItemProps = {
    item: ItemType,
    reorderableUtils: ReorderableUtils<ItemType>,
    isDragOverlay?: boolean
}
function Item({item, reorderableUtils, isDragOverlay = false}: ItemProps) {
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
            reorderableUtils.updateElement(APIResponse.data);
            handleClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleDeleteItem = async () => {
        const APIResponse = await deleteItem(item);
        if ( APIResponse.success ) {
            reorderableUtils.deleteElement(item);
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    return (
        <React.Fragment>
            <Card
                variant="elevation"
                elevation={6}
                sx={{pl: 0}}
                className={classNames('item-card', 'flex-parent', { 'dragging': isDragOverlay })}>
                <CardActionArea onClick={() => handleClickOpen()}>
                    <CardContent>
                        <Typography component="div">{item.name} ({item.display_order})</Typography>
                    </CardContent>
                </CardActionArea>
                <IconButton 
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ml: "0.5em"}}
                    onClick={e => handleDeleteItem()}
                    ><DeleteIcon/>
                </IconButton>
            </Card>
            <UpdateItemDialog open={updateItemDialogOpen} handleClose={handleClose} handleUpdate={handleUpdateItem} item={item} />
        </React.Fragment>
    );
}

function SortableCategory({category, allItems, categoryReorderableUtils, itemReorderableUtils}: CategoryProps) {
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: category.id,
        data: getDraggableData(category, "Category")
    });
    
    return (
        <Box ref={setNodeRef} style={getDraggableTransform(transform, transition, isDragging)} {...listeners} {...attributes}>
            <Category category={category} allItems={allItems} categoryReorderableUtils={categoryReorderableUtils} itemReorderableUtils={itemReorderableUtils} />
        </Box>
    );
}

type CategoryProps = {
    category: CategoryType,
    allItems: Array<ItemType>,
    categoryReorderableUtils: ReorderableUtils<CategoryType>,
    itemReorderableUtils: ReorderableUtils<ItemType>,
    isDragOverlay?: boolean
}
function Category({category, allItems, categoryReorderableUtils, itemReorderableUtils, isDragOverlay = false}: CategoryProps) {
    const items = allItems.filter(item => item.category === category.id);
    const outletContext = useOutletContext() as SnackbarContextType;
    
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
            categoryReorderableUtils.updateElement(APIResponse.data);
            handleClickUpdateCategoryClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleClickDeleteCategory = async () => {
        const APIResponse = await deleteCategory(category);
        if ( APIResponse.success ) {
            categoryReorderableUtils.deleteElement(category);
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    };

    const handleCreateItem = async (name: string) => {
        const APIResponse = await addItem(category, name);
        if ( APIResponse.success ) {
            itemReorderableUtils.createElement(APIResponse.data);
            handleClickCreateItemClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const categoryItems = items.map(item => <SortableItem key={item.id} item={item} reorderableUtils={itemReorderableUtils} />);
    return (
        <Box sx={{ minWidth: 275 }}>
            <Card variant="outlined" className={classNames('category-container', { 'dragging': isDragOverlay })}>
                <Box className='flex-parent' sx={{padding: '0'}}>
                    <CardActionArea onClick={() => handleClickUpdateCategoryOpen()}>
                        <CardContent>    
                            <Typography variant="h5" component="div">
                                {category.name} ({category.display_order})
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ ml: 2 }}
                        onClick={e => handleClickDeleteCategory()}
                        ><DeleteIcon/>
                    </IconButton>
                </Box>
                <UpdateCategoryDialog open={updateCategoryDialogOpen} handleClose={handleClickUpdateCategoryClose} handleUpdate={handleUpdateCategory} category={category} />
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    {categoryItems}
                </SortableContext>
                <Card variant="elevation" elevation={6} className='item-card'>
                    <CardActionArea onClick={() => handleClickCreateItemOpen()}>
                        <CardContent className='flex-parent'>
                            <Typography component="div">
                                Add Item
                            </Typography>
                            <AddIcon />
                        </CardContent>
                    </CardActionArea>
                </Card>
                <CreateItemDialog open={createItemDialogOpen} handleClose={handleClickCreateItemClose} handleCreate={handleCreateItem} />
            </Card>
        </Box>
    );
}

export function FancyList() {
    const list = useLoaderData() as ListType;
    const {
        reorderables: categories,
        setReorderables: setCategories,
        activeElement: activeCategory,
        setActiveElement: setActiveCategory,
        draggableProps,
        reorderableUtils: categoryReorderableUtils
    } = useReorderable(list.categories);
    // may need to e.g. remove items corresponding to deleted categories
    const {
        reorderables: items,
        setReorderables: setItems,
        activeElement: activeItem,
        setActiveElement: setActiveItem,
        reorderableUtils: itemReorderableUtils
    } = useReorderable(list.items);
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
            categoryReorderableUtils.createElement(APIResponse.data);
            handleClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleReorderCategory = async (movedCategory: CategoryType, overCategory: CategoryType) => {
        const oldElements = [...categories];
        categoryReorderableUtils.reorderElement(movedCategory, overCategory);
        
        // calculate new display order based on the position of the category hovered over, as items
        // will not have updated yet
        const APIResponse = await moveCategory(movedCategory, categories.indexOf(overCategory));
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
            setCategories(oldElements);
        }
    }

    const handleReorderItem = async (movedItem: ItemType, overItem: ItemType) => {
        const oldElements = [...items];
        itemReorderableUtils.reorderElement(movedItem, overItem);

        // calculate new display order based on the position of the item hovered over, as items
        // will not have updated yet
        const display_order = items.filter(item => item.category === overItem.category).indexOf(overItem);
        const APIResponse = await moveItem(movedItem, display_order);
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
            setItems(oldElements);
        }
    }

    const listCategories = categories.map(category => <SortableCategory key={category.id} category={category} allItems={items} categoryReorderableUtils={categoryReorderableUtils} itemReorderableUtils={itemReorderableUtils} />);
    return (
        <DndContext
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

            onDragOver={(event: DragOverEvent) => {
                const {active, over} = event;
                if ( ! active.data.current || ! over?.data.current ) {
                    return;
                }

                if ( active.data.current.type !== "Item" ) return;

                const current_item = active.data.current.element;

                let new_category: CategoryType | undefined;
                if ( over.data.current.type === "Category" ) {
                    new_category = over.data.current.element;
                } else {
                    const category_id = over.data.current.element.category;
                    new_category = categories.find(category => category.id === category_id);
                }

                if ( ! new_category ) return;

                current_item.category = new_category.id;
                const newItems = items.map(item => {
                    return item.id === current_item.id ? current_item : item;
                })
                setItems(newItems);
            }}

            {...draggableProps}
        >
            <Card variant="outlined" sx={{ minWidth: 275 }}>
                <CardContent>
                    <Typography variant="h5" component="div">
                        {list.name}
                    </Typography>
                </CardContent>
                {/* Empty div here so that CardContent isn't the last-child, to remove additional padding */}
                <div />
            </Card>
            <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                {listCategories}
            </SortableContext>
            <DragOverlay>
                {activeCategory && <Category category={activeCategory} allItems={items} categoryReorderableUtils={categoryReorderableUtils} itemReorderableUtils={itemReorderableUtils} isDragOverlay={true} />}
                {activeItem && <Item item={activeItem} reorderableUtils={itemReorderableUtils} isDragOverlay={true} />}
            </DragOverlay>
            <Box sx={{ minWidth: 275 }}>
                <Card variant="outlined">
                    <CardActionArea onClick={() => handleClickOpen()}>
                        <CardContent>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Typography variant="h5" component="div">
                                    Add Category
                                </Typography>
                                <AddIcon />
                            </Box>
                        </CardContent>
                    </CardActionArea>
                    <CreateCategoryDialog open={createCategoryDialogOpen} handleClose={handleClose} handleCreate={handleCreateCategory} />
                </Card>
            </Box>
        </DndContext>
    );
}