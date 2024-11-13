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

import { ListType, getLists, deleteList, APIResponse } from '../loaders';
import { CreateListDialog } from '../components/CreateListDialog';
import '../App.css';
import { SnackbarContextType } from './root';

export async function loader() {
    return await getLists();
}

export function ListSummary() {
    const navigate = useNavigate();
    const APIResponse = useLoaderData() as APIResponse<Array<ListType>>;
    const lists = APIResponse.success ? APIResponse.data as Array<ListType> : [];
    const context = useOutletContext() as SnackbarContextType;

    const [createListDialogOpen, setCreateListDialogOpen] = React.useState(false);
    const handleClickOpen = () => {
        setCreateListDialogOpen(true);
    };
    const handleClose = () => {
        setCreateListDialogOpen(false);
    };
    const handleClickDelete = async (listId: number) => {
        const APIResponse = await deleteList(listId);
        if ( APIResponse.success ) {
            navigate(0);
        } else {
            context.setSnackBarError(APIResponse.error);
        }
    };
    
    useEffect(() => {
        if ( ! APIResponse.success ) {
            context.setSnackBarError(APIResponse.error);
        }
    }, []);
        
    const appLists = lists.map(list => {
        const targetURL = `/lists/${list.id}`;
        const createdDate = new Date(list.created_date);

        return (
            <Box key={list.id} sx={{ minWidth: 275 }}>
                <Card variant="outlined" sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <CardActionArea component={Link} to={targetURL}>
                        <CardContent>
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                Created {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString()}
                            </Typography>
                            <Box>
                                <Typography variant="h5" component="div">
                                    {list.name}
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
                        onClick={e => handleClickDelete(list.id)}
                        ><DeleteIcon />
                    </IconButton>
                </Card>
            </Box>
        );
    });

    return (
        <React.Fragment>
            {appLists}
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
        </React.Fragment>
    )
}