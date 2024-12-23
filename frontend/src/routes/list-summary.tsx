import React, { useEffect, useState } from 'react';
import { useLoaderData, Link, useOutletContext } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { ListType, getLists, deleteList, APIResponse, moveList, addList, updateList } from '../loaders';
import { CreateListDialog } from '../components/CreateListDialog';
import './list.css';
import { SnackbarContextType } from './root';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getDraggableData, getDraggableTransform, ReorderableUtils, useReorderable } from '../hooks/useReorderable';
import { UpdateListDialog } from '../components/UpdateListDialog';
import classNames from 'classnames';

export async function loader() {
    return await getLists();
}

function SortableList({list, reorderableUtils}: ListProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: list.id,
        data: getDraggableData(list, "List")
    });
    
    return (
        <Box ref={setNodeRef} style={getDraggableTransform(transform, transition, isDragging)} {...listeners} {...attributes}>
            <List list={list} reorderableUtils={reorderableUtils} />
        </Box>
    );
}

type ListProps = {
    list: ListType,
    reorderableUtils: ReorderableUtils<ListType>,
    isDragOverlay?: boolean
}
function List({list, reorderableUtils, isDragOverlay = false}: ListProps) {
    const outletContext = useOutletContext() as SnackbarContextType;
    const [updateListDialogOpen, setUpdateListDialogOpen] = useState(false);
    const handleClickUpdateListOpen = () => {
        setUpdateListDialogOpen(true);
      };
      const handleClickUpdateListClose = () => {
        setUpdateListDialogOpen(false);
    };

    const handleUpdateList = async (name: string) => {
        const APIResponse = await updateList(list, name);
        if ( APIResponse.success ) {
            reorderableUtils.updateElement(APIResponse.data);
            handleClickUpdateListClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleDeleteList = async () => {
        const APIResponse = await deleteList(list);
        if ( APIResponse.success ) {
            reorderableUtils.deleteElement(list);
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }
    
    const targetURL = `/lists/${list.id}`;
    const createdDate = new Date(list.created_date);

    return (
        <React.Fragment>
            <Card
                variant="outlined"
                sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                className={classNames({ 'dragging': isDragOverlay })}
            >
                <CardActionArea component={Link} to={targetURL}>
                    <CardContent>
                        <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                            Created {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString()}
                        </Typography>
                        <Box>
                            <Typography variant="h5" component="div">
                                {list.name} ({list.display_order})
                            </Typography>
                        </Box>
                    </CardContent>
                </CardActionArea>
                <IconButton 
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2, ml: 2 }}
                    onClick={e => handleClickUpdateListOpen()}
                    ><EditIcon />
                </IconButton>
                <IconButton 
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"                           
                    sx={{ mr: 2 }}
                    onClick={e => handleDeleteList()}
                    ><DeleteIcon />
                </IconButton>
            </Card>
            <UpdateListDialog open={updateListDialogOpen} handleClose={handleClickUpdateListClose} handleUpdate={handleUpdateList} list={list} />
        </React.Fragment>
    );
}

export function ListSummary() {
    const APIResponse = useLoaderData() as APIResponse<Array<ListType>>;
    const APIResponseLists = APIResponse.success ? APIResponse.data as Array<ListType> : [];
    const {
        reorderables: lists,
        setReorderables: setLists,
        activeElement: activeList,
        setActiveElement: setActiveList,
        draggableProps,
        reorderableUtils
    } = useReorderable(APIResponseLists);
    const outletContext = useOutletContext() as SnackbarContextType;

    const [createListDialogOpen, setCreateListDialogOpen] = useState(false);
    const handleClickCreateListOpen = () => {
        setCreateListDialogOpen(true);
    };
    const handleClickCreateListClose = () => {
        setCreateListDialogOpen(false);
    };
    const handleCreateList = async (name: string) => {
        const APIResponse = await addList(name);
        if ( APIResponse.success ) {
            reorderableUtils.createElement(APIResponse.data);
            handleClickCreateListClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleReorderList = async (movedList: ListType, overList: ListType) => {
        const oldElements = [...lists];
        reorderableUtils.reorderElement(movedList, overList);
        
        // calculate new display order based on the position of the list hovered over, as items
        // will not have updated yet
        const APIResponse = await moveList(movedList, lists.indexOf(overList));
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
            setLists(oldElements);
        }
    }
    
    useEffect(() => {
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
        }
    });
        
    const appLists = lists.map(list => <SortableList key={list.id} list={list} reorderableUtils={reorderableUtils} />);
    return (
        <DndContext
            onDragStart={(event: DragStartEvent) => {
                const {active} = event;
                if ( ! active.data.current ) return;

                setActiveList(active.data.current.element);
            }}

            onDragEnd={(event: DragEndEvent) => {
                setActiveList(null);
                
                const {active, over} = event;
                if ( ! active.data.current || ! over?.data.current ) {
                    return;
                }

                handleReorderList(active.data.current.element, over.data.current.element);
            }}

            {...draggableProps}
        >
            <SortableContext items={lists} strategy={verticalListSortingStrategy}>
                {appLists}
            </SortableContext>
            <DragOverlay>
                {activeList && <List list={activeList} reorderableUtils={reorderableUtils} isDragOverlay={true} />}
            </DragOverlay>
            <Box key="Add List" sx={{ minWidth: 275 }}>
                <Card variant="outlined" sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <CardActionArea onClick={() => handleClickCreateListOpen()}>
                    <CardContent sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant="h5" component="div">
                                Add List
                            </Typography>
                            <AddIcon />
                        </CardContent>
                    </CardActionArea>
                    <CreateListDialog open={createListDialogOpen} handleClose={handleClickCreateListClose} handleCreate={handleCreateList} />
                </Card>
            </Box>
        </DndContext>
    )
}