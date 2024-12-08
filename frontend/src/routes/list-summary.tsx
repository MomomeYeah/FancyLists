import React, { useEffect } from 'react';
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

import { ListType, getLists, deleteList, APIResponse, updateListDisplayOrder, addList, updateList } from '../loaders';
import { CreateListDialog } from '../components/CreateListDialog';
import '../App.css';
import { SnackbarContextType } from './root';
import { DndContext, DraggableAttributes, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DragIndicator } from '@mui/icons-material';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { getDraggableData, getDraggableTransform, ReorderableUtils, useReorderable } from '../hooks/useReorderable';
import { UpdateListDialog } from '../components/UpdateListDialog';

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
    } = useSortable({
        id: list.id,
        data: getDraggableData(list)
    });
    
    return (
        <Box ref={setNodeRef} style={getDraggableTransform(transform, transition)}>
            <List list={list} reorderableUtils={reorderableUtils} listeners={listeners} attributes={attributes} />
        </Box>
    );
}

type ListProps = {
    list: ListType,
    reorderableUtils: ReorderableUtils<ListType>,
    listeners?: SyntheticListenerMap,
    attributes?: DraggableAttributes
}
function List({list, reorderableUtils, listeners, attributes}: ListProps) {
    const outletContext = useOutletContext() as SnackbarContextType;
    const [updateListDialogOpen, setUpdateListDialogOpen] = React.useState(false);
    const handleClickUpdateListOpen = () => {
        setUpdateListDialogOpen(true);
      };
      const handleClickUpdateListClose = () => {
        setUpdateListDialogOpen(false);
    };

    const handleUpdateList = async (name: string) => {
        const APIResponse = await updateList(list.id, name);
        if ( APIResponse.success ) {
            reorderableUtils.updateElement(APIResponse.data);
            handleClickUpdateListClose();
        } else {
            outletContext.setSnackBarError(APIResponse.error);
        }
    }

    const handleDeleteList = async () => {
        const APIResponse = await deleteList(list.id);
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
            <Card variant="outlined" sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <IconButton {...attributes} {...listeners}
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ ml: 2, mr: 2 }}
                    ><DragIndicator />
                </IconButton>
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
    const onReorder = async (listId: number, newDisplayOrder: number) => {
        handleReorderList(listId, newDisplayOrder);
    }
    const {
        reorderables,
        setReorderables,
        activeElement,
        draggableProps,
        reorderableUtils
    } = useReorderable(APIResponseLists, onReorder);
    const lists = reorderables;
    const outletContext = useOutletContext() as SnackbarContextType;

    const [createListDialogOpen, setCreateListDialogOpen] = React.useState(false);
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

    const handleReorderList = async (listId: number, newDisplayOrder: number) => {
        const oldElements = [...reorderables];
        reorderableUtils.reorderElement(listId, newDisplayOrder);
        const APIResponse = await updateListDisplayOrder(listId, newDisplayOrder);
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
            setReorderables(oldElements);
        }
    }
    
    useEffect(() => {
        if ( ! APIResponse.success ) {
            outletContext.setSnackBarError(APIResponse.error);
        }
    });
        
    const appLists = lists.map(list => <SortableList key={list.id} list={list} reorderableUtils={reorderableUtils} />);
    return (
        <DndContext {...draggableProps}>
            <SortableContext items={lists} strategy={verticalListSortingStrategy}>
                {appLists}
            </SortableContext>
            <DragOverlay>
                {activeElement ? <List list={activeElement} reorderableUtils={reorderableUtils} /> : null}
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