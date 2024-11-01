import React from 'react';
import { Params, useLoaderData } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { SvgIconComponent } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { ListType, CategoryType, getList } from '../loaders';
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

function ItemArea({text, Icon}: {text: string, Icon: SvgIconComponent}) {
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
            <Typography component={'div'} sx={{flexGrow: 2}}>{text}</Typography>
            <Icon sx={{flexGrow: 1}} />
        </Paper>
    );
}

function Category({category}: {category: CategoryType}) {
    const categoryItems = category.items.map(item => {
        return (
            <ItemArea key={item.id} text={item.name} Icon={DeleteIcon} />
        );
    })

    return (
        <Box sx={{ minWidth: 275 }}>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h5" component="div">
                        {category.name}
                    </Typography>
                    <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        display: 'grid',
                        gridTemplateColumns: { md: '1fr 1fr' },
                        gap: 2
                    }}>
                        {categoryItems}
                        <ItemArea key='Add Item' text='Add Item' Icon={AddIcon} />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export function FancyList() {
    const list = useLoaderData() as ListType;
    const listCategories = list.categories.map(category => <Category key={category.id} category={category} />);

    return (
        <React.Fragment>
            {listCategories}
            <Box sx={{ minWidth: 275 }}>
                <Card variant="outlined">
                    <CardActionArea>
                        <CardContent>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Typography variant="h5" component="div">
                                    Add Category
                                </Typography>
                                <AddIcon />
                            </Box>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Box>
        </React.Fragment>
    );
}