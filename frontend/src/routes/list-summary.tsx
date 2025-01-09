import React, { useEffect, useState } from 'react';
import { useLoaderData, Link, useOutletContext } from 'react-router-dom';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { ListType, getLists, deleteList, APIResponse, moveList, addList, updateList } from '../loaders';
import { CreateListDialog } from '../components/CreateListDialog';
import { SnackbarContextType } from './root';
import { closestCenter, DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getDraggableData, getDraggableTransform, reorderElement, useReorderable } from '../hooks/useReorderable';
import { UpdateListDialog } from '../components/UpdateListDialog';
import classNames from 'classnames';
import { Container } from '@mui/material';

export async function loader() {
    return await getLists();
}

function SortableList(props: ListProps) {
    const list = props.list;
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
            <List {...props} />
        </Box>
    );
}

type ListProps = {
    list: ListType,
    updateLists: Function,
    deleteLists: Function,
    isDragOverlay?: boolean
}
function List({list, updateLists, deleteLists, isDragOverlay = false}: ListProps) {
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
            updateLists(APIResponse.data);
            handleClickUpdateListClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleDeleteList = async () => {
        const APIResponse = await deleteList(list);
        if ( APIResponse.success ) {
            deleteLists(list);
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }
    
    const targetURL = `/lists/${list.id}`;
    const createdDate = new Date(list.created_date);

    return (
        <React.Fragment>
            <Box
                className={classNames('fancylist', { 'dragging': isDragOverlay })}
                sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
            >
                <Box
                    component={Link}
                    to={targetURL}
                    className="fancylist-header"
                    sx={{flexGrow: 1}}
                >
                    <Typography gutterBottom>
                        Created {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString()}
                    </Typography>
                    <Box>
                        <Typography variant="h5" component="div">
                            {list.name}
                        </Typography>
                    </Box>
                </Box>
                <IconButton 
                    size="large"
                    edge="start"
                    aria-label="menu"
                    onClick={e => handleClickUpdateListOpen()}
                    ><EditIcon />
                </IconButton>
                <IconButton 
                    size="large"
                    edge="start"
                    aria-label="menu"
                    onClick={e => handleDeleteList()}
                    ><DeleteIcon />
                </IconButton>
            </Box>
            <UpdateListDialog open={updateListDialogOpen} handleClose={handleClickUpdateListClose} handleUpdate={handleUpdateList} list={list} />
        </React.Fragment>
    );
}

export function ListSummary() {
    const APIResponse = useLoaderData() as APIResponse<Array<ListType>>;
    const APIResponseLists = APIResponse.success ? APIResponse.data as Array<ListType> : [];
    const [lists, setLists] = useState<ListType[]>(APIResponseLists);
    const [activeList, setActiveList] = useState<ListType | null>(null);
    const {draggableProps} = useReorderable();
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
            setLists([...lists, APIResponse.data]);
            handleClickCreateListClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleUpdateLists = (list: ListType) => {
        setLists(lists.map(l => l.id === list.id ? list : l));
    }

    const handleDeleteLists = (list: ListType) => {
        setLists(lists.filter(l => l.id !== list.id));
    }

    const handleReorderList = async (movedList: ListType, overList: ListType) => {
        const oldElements = [...lists];
        setLists(reorderElement(lists, movedList, overList));
        
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
        
    const appLists = lists.map(list => 
        <SortableList
            key={list.id}
            list={list}
            updateLists={handleUpdateLists}
            deleteLists={handleDeleteLists} />
    );
    return (
        <Container maxWidth="md">
            <DndContext
                collisionDetection={closestCenter}
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
                    {activeList && <List list={activeList} updateLists={handleUpdateLists} deleteLists={handleDeleteLists} isDragOverlay={true} />}
                </DragOverlay>
                <Box
                    className="fancylist"
                    sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                    onClick={() => handleClickCreateListOpen()}
                >
                    <Typography variant="h5" component="div">
                        Add List
                    </Typography>
                    <AddIcon />
                </Box>
                <CreateListDialog open={createListDialogOpen} handleClose={handleClickCreateListClose} handleCreate={handleCreateList} />
            </DndContext>
        </Container>
    )
}