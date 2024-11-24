import React, { useEffect } from 'react';
import { useLoaderData, Link, useNavigate, useOutletContext } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { ListType, getLists, deleteList, APIResponse, updateListDisplayOrder } from '../loaders';
import { CreateListDialog } from '../components/CreateListDialog';
import '../App.css';
import { SnackbarContextType } from './root';
import { DndContext, DraggableAttributes, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DragIndicator } from '@mui/icons-material';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { getDraggableData, getDraggableTransform, useReorderable } from '../hooks/useReorderable';
import { UpdateListDialog } from '../components/UpdateListDialog';

export async function loader() {
    return await getLists();
}

function SortableList({list}: {list: ListType}) {
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
            <List list={list} listeners={listeners} attributes={attributes} />
        </Box>
    );
}

function List({list, listeners, attributes}: {list: ListType, listeners?: SyntheticListenerMap, attributes?: DraggableAttributes}) {
    const navigate = useNavigate();
    const context = useOutletContext() as SnackbarContextType;

    const [updateListDialogOpen, setUpdateListDialogOpen] = React.useState(false);
    const handleClickUpdateListOpen = () => {
        setUpdateListDialogOpen(true);
      };
      const handleClickUpdateListClose = () => {
        setUpdateListDialogOpen(false);
    };

    const handleClickDelete = async (listId: number) => {
        const APIResponse = await deleteList(listId);
        if ( APIResponse.success ) {
            navigate(0);
        } else {
            context.setSnackBarError(APIResponse.error);
        }
    };

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
                    onClick={e => handleClickDelete(list.id)}
                    ><DeleteIcon />
                </IconButton>
            </Card>
            <UpdateListDialog open={updateListDialogOpen} handleClose={handleClickUpdateListClose} list={list} />
        </React.Fragment>
    );
}

export function ListSummary() {
    const APIResponse = useLoaderData() as APIResponse<Array<ListType>>;
    const lists = APIResponse.success ? APIResponse.data as Array<ListType> : [];
    const [activeList, handleDragStart, handleDragEnd] = useReorderable(lists, updateListDisplayOrder);
    const context = useOutletContext() as SnackbarContextType;

    const [createListDialogOpen, setCreateListDialogOpen] = React.useState(false);
    const handleClickOpen = () => {
        setCreateListDialogOpen(true);
    };
    const handleClose = () => {
        setCreateListDialogOpen(false);
    };
    
    useEffect(() => {
        if ( ! APIResponse.success ) {
            context.setSnackBarError(APIResponse.error);
        }
    });
        
    const appLists = lists.map(list => <SortableList key={list.id} list={list} />);
    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={lists} strategy={verticalListSortingStrategy}>
                {appLists}
            </SortableContext>
            <DragOverlay>
                {activeList ? <List list={activeList} /> : null}
            </DragOverlay>
            <Box key="Add List" sx={{ minWidth: 275 }}>
                <Card variant="outlined" sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <CardActionArea onClick={() => handleClickOpen()}>
                    <CardContent sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant="h5" component="div">
                                Add List
                            </Typography>
                            <AddIcon />
                        </CardContent>
                    </CardActionArea>
                    <CreateListDialog open={createListDialogOpen} handleClose={handleClose} />
                </Card>
            </Box>
        </DndContext>
    )
}