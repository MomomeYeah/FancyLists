import { Link, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import '../App.css';

export function Root() {
    return (
        <Container maxWidth="md">
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton 
                            id="demo-positioned-button"
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"                           
                            sx={{ mr: 2 }}
                            ><MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Fancy Lists</Typography>
                        <Button color="inherit" component={Link} to="/">Home</Button>
                        <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar>
            </Box>
            <Outlet />
        </Container>
    );
}