import React from 'react';
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
import { ListType, CategoryType, getList, deleteCategory, updateItemDisplayOrder, deleteItem, updateCategoryDisplayOrder, ItemType, updateCategory, addCategory, addItem, updateItem } from '../loaders';
import { SnackbarContextType } from './root';
import './list.css';
import { DndContext, DraggableAttributes, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DragIndicator } from '@mui/icons-material';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { getDraggableData, getDraggableTransform, ReorderableUtils, useReorderable } from '../hooks/useReorderable';
import { UpdateItemDialog } from '../components/UpdateItemDialog';
import { UpdateCategoryDialog } from '../components/UpdateCategoryDialog';

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
    } = useSortable({
        id: item.id,
        data: getDraggableData(item)
    });
    
    return (
        <Box ref={setNodeRef} style={getDraggableTransform(transform, transition)}>
            <Item item={item} reorderableUtils={reorderableUtils} listeners={listeners} attributes={attributes} />
        </Box>
    );
}

type ItemProps = {
    item: ItemType,
    reorderableUtils: ReorderableUtils<ItemType>,
    listeners?: SyntheticListenerMap,
    attributes?: DraggableAttributes    
}
function Item({item, reorderableUtils, listeners, attributes}: ItemProps) {
    const outletContext = useOutletContext() as SnackbarContextType;
    
    const [updateItemDialogOpen, setUpdateItemDialogOpen] = React.useState(false);
    const handleClickOpen = () => {
        setUpdateItemDialogOpen(true);
      };
      const handleClose = () => {
        setUpdateItemDialogOpen(false);
    };

    const handleUpdateItem = async (name: string) => {
        const APIResponse = await updateItem(item.id, name);
        if ( APIResponse.success ) {
            reorderableUtils.updateElement(APIResponse.data);
            handleClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleDeleteItem = async () => {
        const APIResponse = await deleteItem(item.id);
        if ( APIResponse.success ) {
            reorderableUtils.deleteElement(item);
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    return (
        <React.Fragment>
            <Card variant="elevation" elevation={6} className='item-card flex-parent'>
                <IconButton {...attributes} {...listeners}
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{mr: "0.5em"}}
                    ><DragIndicator />
                </IconButton>
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

function SortableCategory({category, reorderableUtils}: CategoryProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: category.id,
        data: getDraggableData(category)
    });
    
    return (
        <Box ref={setNodeRef} style={getDraggableTransform(transform, transition)}>
            <Category category={category} reorderableUtils={reorderableUtils} listeners={listeners} attributes={attributes} />
        </Box>
    );
}

type CategoryProps = {
    category: CategoryType,
    reorderableUtils: ReorderableUtils<CategoryType>,
    listeners?: SyntheticListenerMap,
    attributes?: DraggableAttributes
}
function Category({category, reorderableUtils, listeners, attributes}: CategoryProps) {
    const onReorder = async (itemId: number, newDisplayOrder: number) => {
        handleReorderItem(itemId, newDisplayOrder);
    }
    const {
        reorderables,
        setReorderables,
        activeElement,
        draggableProps,
        reorderableUtils: itemReorderableUtils
    } = useReorderable(category.items, onReorder);
    const items = reorderables;
    // const context = useContext(ReorderableContext);
    const outletContext = useOutletContext() as SnackbarContextType;
    
    const [createItemDialogOpen, setCreateItemDialogOpen] = React.useState(false);
    const handleClickCreateItemOpen = () => {
        setCreateItemDialogOpen(true);
      };
      const handleClickCreateItemClose = () => {
        setCreateItemDialogOpen(false);
    };

    const [updateCategoryDialogOpen, setUpdateCategoryDialogOpen] = React.useState(false);
    const handleClickUpdateCategoryOpen = () => {
        setUpdateCategoryDialogOpen(true);
      };
      const handleClickUpdateCategoryClose = () => {
        setUpdateCategoryDialogOpen(false);
    };

    const handleUpdateCategory = async (name: string) => {
        const APIResponse = await updateCategory(category.id, name);
        if ( APIResponse.success ) {
            reorderableUtils.updateElement(APIResponse.data);
            handleClickUpdateCategoryClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleClickDeleteCategory = async () => {
        const APIResponse = await deleteCategory(category.id);
        if ( APIResponse.success ) {
            reorderableUtils.deleteElement(category);
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    };

    const handleCreateItem = async (name: string) => {
        const APIResponse = await addItem(category.id, name);
        if ( APIResponse.success ) {
            itemReorderableUtils.createElement(APIResponse.data);
            handleClickCreateItemClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleReorderItem = async (itemId: number, newDisplayOrder: number) => {
        const oldElements = [...reorderables];
        itemReorderableUtils.reorderElement(itemId, newDisplayOrder);
        const APIResponse = await updateItemDisplayOrder(itemId, newDisplayOrder);
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
            setReorderables(oldElements);
        }
    }

    const categoryItems = items.map(item => <SortableItem key={item.id} item={item} reorderableUtils={itemReorderableUtils} />);
    return (
        <DndContext {...draggableProps}>
            <Box sx={{ minWidth: 275 }}>
                <Card variant="outlined" className='category-container'>
                    <Box className='flex-parent' sx={{padding: '0'}}>
                        <IconButton {...attributes} {...listeners}
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            ><DragIndicator />
                        </IconButton>
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
                            onClick={e => handleClickDeleteCategory()}
                            ><DeleteIcon/>
                        </IconButton>
                    </Box>
                    <UpdateCategoryDialog open={updateCategoryDialogOpen} handleClose={handleClickUpdateCategoryClose} handleUpdate={handleUpdateCategory} category={category} />
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        {categoryItems}
                    </SortableContext>
                    <DragOverlay>
                        {activeElement ? <Item item={activeElement} reorderableUtils={itemReorderableUtils} /> : null}
                    </DragOverlay>
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
        </DndContext>
    );
}

export function FancyList() {
    const list = useLoaderData() as ListType;
    const onReorder = async (categoryId: number, newDisplayOrder: number) => {
        handleReorderCategory(categoryId, newDisplayOrder);
    }
    const {
        reorderables,
        setReorderables,
        activeElement,
        draggableProps,
        reorderableUtils
    } = useReorderable(list.categories, onReorder);
    const categories = reorderables;
    const outletContext = useOutletContext() as SnackbarContextType;
    
    const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = React.useState(false);
    const handleClickOpen = () => {
        setCreateCategoryDialogOpen(true);
      };
      const handleClose = () => {
        setCreateCategoryDialogOpen(false);
    };

    const handleCreateCategory = async (name: string) => {
        const APIResponse = await addCategory(list.id, name);
        if ( APIResponse.success ) {
            reorderableUtils.createElement(APIResponse.data);
            handleClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleReorderCategory = async (categoryId: number, newDisplayOrder: number) => {
        const oldElements = [...reorderables];
        reorderableUtils.reorderElement(categoryId, newDisplayOrder);
        const APIResponse = await updateCategoryDisplayOrder(categoryId, newDisplayOrder);
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
            setReorderables(oldElements);
        }
    }

    const listCategories = categories.map(category => <SortableCategory key={category.id} category={category} reorderableUtils={reorderableUtils} />);
    return (
        <DndContext {...draggableProps}>
            <Box sx={{ minWidth: 275 }}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h5" component="div">
                            {list.name}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
            <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                {listCategories}
            </SortableContext>
            <DragOverlay>
                {activeElement ? <Category category={activeElement} reorderableUtils={reorderableUtils} /> : null}
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