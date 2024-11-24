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

    const [updateItemDialogOpen, setUpdateItemDialogOpen] = React.useState(false);
    const handleClickOpen = () => {
        setUpdateItemDialogOpen(true);
      };
      const handleClose = () => {
        setUpdateItemDialogOpen(false);
    };

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
                    onClick={e => handleClickDeleteItem()}
                    ><DeleteIcon/>
                </IconButton>
            </Card>
            <UpdateItemDialog open={updateItemDialogOpen} handleClose={handleClose} item={item} />
        </React.Fragment>
    );
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
                            onClick={e => handleClickDeleteCategory(category.id)}
                            ><DeleteIcon/>
                        </IconButton>
                    </Box>
                    <UpdateCategoryDialog open={updateCategoryDialogOpen} handleClose={handleClickUpdateCategoryClose} category={category} />
                    <SortableContext items={category.items} strategy={verticalListSortingStrategy}>
                        {categoryItems}
                    </SortableContext>
                    <DragOverlay>
                        {activeItem ? <Item item={activeItem} /> : null}
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
                    <CreateItemDialog open={createItemDialogOpen} handleClose={handleClickCreateItemClose} category={category.id} />
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