import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { SvgIconComponent } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { ListType, getLists } from '../loaders';
import '../App.css';

export async function loader() {
    return await getLists();
}

type ListAreaProps = {
    text: string,
    targetURL: string,
    Icon: SvgIconComponent,
    Description?: React.ReactElement
}
function ListArea({text, targetURL, Icon, Description}: ListAreaProps) {
    return (
        <Box sx={{ minWidth: 275 }}>
            <Card variant="outlined">
                <CardActionArea component={Link} to={targetURL}>
                    <CardContent>
                        {Description}
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant="h5" component="div">
                                {text}
                            </Typography>
                            <Icon />
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Box>
    );
}

export function ListSummary() {
    const lists = useLoaderData() as Array<ListType>;
    
    const appLists: any = [];
    lists.forEach((list: ListType) => {
        const targetURL = `/lists/${list.id}`;
        const createdDate = new Date(list.created_date);
        const Description = 
            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                Created {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString()}
            </Typography>

        appLists.push(
            <ListArea key={list.id} text={list.name} targetURL={targetURL} Icon={DeleteIcon} Description={Description} />
        );
    });

    return (
        <React.Fragment>
            {appLists}
            <ListArea key="Add List" text="Add List" targetURL="/" Icon={AddIcon} />
        </React.Fragment>
    )
}