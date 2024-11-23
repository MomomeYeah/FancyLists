import React from 'react';
import { Params, redirect, useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';

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
import { ListType, CategoryType, getList, deleteCategory, updateItemDisplayOrder, deleteItem, updateCategoryDisplayOrder, ItemType } from '../loaders';
import { SnackbarContextType } from './root';
import './list.css';
import { DndContext, DraggableAttributes, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DragIndicator } from '@mui/icons-material';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { getDraggableData, getDraggableTransform, useReorderable } from '../hooks/useReorderable';

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

function SortableItem({item}: {item: ItemType}) {
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
            <Item item={item} listeners={listeners} attributes={attributes} />
        </Box>
    );
}

function Item({item, listeners, attributes}: {item: ItemType, listeners?: SyntheticListenerMap, attributes?: DraggableAttributes}) {
    const navigate = useNavigate();
    const context = useOutletContext() as SnackbarContextType;
    
    const handleClickDeleteItem = async () => {
        const APIResponse = await deleteItem(item.id);
        if ( APIResponse.success ) {
            navigate(0);
        } else {
            context.setSnackBarError(APIResponse.error);
        }
    };

    return (
        <Card variant="elevation" elevation={6} className='item-card'>
            <CardContent className='flex-parent'>
                <IconButton {...attributes} {...listeners}
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    ><DragIndicator />
                </IconButton>
                <Typography component="div">{item.name} ({item.display_order})</Typography>
                <IconButton 
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={e => handleClickDeleteItem()}
                    ><DeleteIcon/>
                </IconButton>
            </CardContent>
        </Card>
    )
}

function SortableCategory({category}: {category: CategoryType}) {
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
            <Category category={category} listeners={listeners} attributes={attributes} />
        </Box>
    );
}

function Category({category, listeners, attributes}: {category: CategoryType, listeners?: SyntheticListenerMap, attributes?: DraggableAttributes}) {
    const navigate = useNavigate();
    const context = useOutletContext() as SnackbarContextType;
    const [activeItem, handleDragStart, handleDragEnd] = useReorderable(category.items, updateItemDisplayOrder);
    
    const [createItemDialogOpen, setCreateItemDialogOpen] = React.useState(false);
    const handleClickOpen = () => {
        setCreateItemDialogOpen(true);
      };
      const handleClose = () => {
        setCreateItemDialogOpen(false);
    };
    const handleClickDeleteCategory = async (categoryId: number) => {
        const APIResponse = await deleteCategory(categoryId);
        if ( APIResponse.success ) {
            navigate(0);
        } else {
            context.setSnackBarError(APIResponse.error);
        }
    };

    const categoryItems = category.items.map(item => <SortableItem key={item.id} item={item} />);
    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Box sx={{ minWidth: 275 }}>
                <Card variant="outlined">
                    <CardContent>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <IconButton {...attributes} {...listeners}
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                ><DragIndicator />
                            </IconButton>
                            <Typography variant="h5" component="div">
                                {category.name} ({category.display_order})
                            </Typography>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={e => handleClickDeleteCategory(category.id)}
                                ><DeleteIcon/>
                            </IconButton>
                        </Box>
                        <SortableContext items={category.items} strategy={verticalListSortingStrategy}>
                            {categoryItems}
                        </SortableContext>
                        <DragOverlay>
                            {activeItem ? <Item item={activeItem} /> : null}
                        </DragOverlay>
                        <Card variant="elevation" elevation={6} className='item-card'>
                            <CardActionArea onClick={() => handleClickOpen()}>
                                <CardContent className='flex-parent'>
                                    <Typography component="div">
                                        Add Item
                                    </Typography>
                                    <AddIcon />
                                </CardContent>
                            </CardActionArea>
                        </Card>
                        <CreateItemDialog open={createItemDialogOpen} handleClose={handleClose} category={category.id} />
                    </CardContent>
                </Card>
            </Box>
        </DndContext>
    );
}

export function FancyList() {
    const list = useLoaderData() as ListType;
    const [activeCategory, handleDragStart, handleDragEnd] = useReorderable(list.categories, updateCategoryDisplayOrder);
    const listCategories = list.categories.map(category => <SortableCategory key={category.id} category={category} />);

    const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = React.useState(false);
    const handleClickOpen = () => {
        setCreateCategoryDialogOpen(true);
      };
      const handleClose = () => {
        setCreateCategoryDialogOpen(false);
    };

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Box sx={{ minWidth: 275 }}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h5" component="div">
                            {list.name}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
            <SortableContext items={list.categories} strategy={verticalListSortingStrategy}>
                {listCategories}
            </SortableContext>
            <DragOverlay>
                {activeCategory ? <Category category={activeCategory} /> : null}
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
                    <CreateCategoryDialog open={createCategoryDialogOpen} handleClose={handleClose} list={list.id} />
                </Card>
            </Box>
        </DndContext>
    );
}