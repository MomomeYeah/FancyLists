import React from 'react';
import { Params, useLoaderData, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { ListType, CategoryType, getList, deleteCategory, deleteItem } from '../loaders';
import { CreateCategoryDialog } from '../components/CreateCategoryDialog';
import { CreateItemDialog } from '../components/CreateItemDialog';
import { CardActionArea } from '@mui/material';

export async function loader({ params }: {params: Params<"listId">}) {
    if ( params.hasOwnProperty("listId") ) {
        const listId = Number(params.listId)
        if ( ! isNaN(listId) ) {
            return await getList(listId);
        }
    }

    throw new Error("Unable to parse route param");
}

function ItemArea({children}: {children: React.ReactNode}) {
    return (
        <Paper
            elevation={6}
            sx={{
                height: '60px',
                lineHeight: '60px',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            {children}
        </Paper>
    );
}

function Category({category}: {category: CategoryType}) {
    const navigate = useNavigate();
    
    const [createItemDialogOpen, setCreateItemDialogOpen] = React.useState(false);
    const handleClickOpen = () => {
        setCreateItemDialogOpen(true);
      };
      const handleClose = () => {
        setCreateItemDialogOpen(false);
    };
    const handleClickDeleteCategory = async (categoryId: number) => {
        await deleteCategory(categoryId);
        navigate(0);
    };
    const handleClickDeleteItem = async (itemId: number) => {
        await deleteItem(itemId);
        navigate(0);
    };

    const categoryItems = category.items.map(item => {
        return (
            <ItemArea key={item.id}>
                <Typography component={'div'} sx={{flexGrow: 2}}>{item.name}</Typography>
                <IconButton 
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"                           
                    sx={{ mr: 2 }}
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
                            sx={{ mr: 2 }}
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
                        <ItemArea key="Add Item">
                            <Typography component={'div'} sx={{flexGrow: 2}}>Add Item</Typography>
                            <IconButton 
                                id="demo-positioned-button"
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"                           
                                sx={{ mr: 2 }}
                                onClick={() => handleClickOpen()}
                                ><AddIcon/>
                            </IconButton>
                        </ItemArea>
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