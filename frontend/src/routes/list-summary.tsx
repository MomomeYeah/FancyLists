import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

import { ListType, getLists } from '../loaders';
import '../App.css';

export async function loader() {
    return await getLists();
}

export function ListSummary() {
    const lists = useLoaderData() as Array<ListType>;
    
    const appLists: any = [];
    lists.forEach((list: ListType) => {
        const targetURL = `/lists/${list.id}`;
        const createdDate = new Date(list.created_date);

        appLists.push(
            <Box key={list.id} sx={{ minWidth: 275 }}>
                <Card variant="outlined">
                    <CardActionArea component={Link} to={targetURL}>
                        <CardContent>
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                Created {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString()}
                            </Typography>
                            <Typography variant="h5" component="div">
                                {list.name}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Box>
        );
    });

    return (
        <React.Fragment>
            {appLists}
        </React.Fragment>
    )
}