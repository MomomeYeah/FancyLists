import React from 'react';
import { Form, Params, useLoaderData } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import { ListType, CategoryType, getList } from '../loaders';

export async function loader({ params }: {params: Params<"listId">}) {
    if ( params.hasOwnProperty("listId") ) {
        const listId = Number(params.listId)
        if ( ! isNaN(listId) ) {
            return await getList(listId);
        }
    }

    throw new Error("Unable to parse route param");
}

function Category({category}: {category: CategoryType}) {
    const categoryItems = category.items.map(item => {
        return (
            <Paper
                key={item.id}
                elevation={6}
                sx={{height: '60px', lineHeight: '60px', textAlign: 'center'}}
            >
                {item.name}
            </Paper>
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
                        gap: 2,
                    }}>
                        {categoryItems}
                        <Paper component={Form} method='POST'
                            key='Add Item'
                            elevation={6}
                            sx={{height: '60px', lineHeight: '60px', textAlign: 'center'}}
                        >Add Item</Paper>
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
        </React.Fragment>
    );
}