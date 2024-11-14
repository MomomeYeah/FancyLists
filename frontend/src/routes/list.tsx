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
import { ListType, CategoryType, getList, deleteCategory, deleteItem } from '../loaders';
import { SnackbarContextType } from './root';
import './list.css';

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

function ItemArea({children}: {children: React.ReactNode}) {
    return (
        <Card variant="elevation" elevation={6} className='item-card'>
            <CardContent className='flex-parent'>
                {children}
            </CardContent>
        </Card>
    );
}

function Category({category}: {category: CategoryType}) {
    const navigate = useNavigate();
    const context = useOutletContext() as SnackbarContextType;
    
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
    const handleClickDeleteItem = async (itemId: number) => {
        const APIResponse = await deleteItem(itemId);
        if ( APIResponse.success ) {
            navigate(0);
        } else {
            context.setSnackBarError(APIResponse.error);
        }
    };

    const categoryItems = category.items.map(item => {
        return (
            <ItemArea key={item.id}>
                <Typography component="div">{item.name}</Typography>
                <IconButton 
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={e => handleClickDeleteItem(item.id)}
                    ><DeleteIcon/>
                </IconButton>
            </ItemArea>
        );
    });

    return (
        <Box sx={{ minWidth: 275 }}>
            <Card variant="outlined">
                <CardContent>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Typography variant="h5" component="div">
                            {category.name}
                        </Typography>
                        <IconButton 
                            id="demo-positioned-button"
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"                           
                            sx={{ mr: 2, padding: '5px' }}
                            onClick={e => handleClickDeleteCategory(category.id)}
                            ><DeleteIcon/>
                        </IconButton>
                    </Box>
                    <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        display: 'grid',
                        gridTemplateColumns: { md: '1fr 1fr' },
                        gap: 2
                    }}>
                        {categoryItems}
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
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export function FancyList() {
    const list = useLoaderData() as ListType;
    const listCategories = list.categories.map(category => <Category key={category.id} category={category} />);

    const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = React.useState(false);
    const handleClickOpen = () => {
        setCreateCategoryDialogOpen(true);
      };
      const handleClose = () => {
        setCreateCategoryDialogOpen(false);
    };

    return (
        <React.Fragment>
            <Box sx={{ minWidth: 275 }}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h5" component="div">
                            {list.name}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
            {listCategories}
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
        </React.Fragment>
    );
}