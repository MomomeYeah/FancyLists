import { useState } from 'react';
import { Link, Navigate, Outlet, useSearchParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Snackbar from '@mui/material/Snackbar';

import { AuthProvider, useAuth } from "../hooks/useAuth";
import '../App.css';

export type SnackbarContextType = {
    setSnackBarSuccess: Function,
    setSnackBarError: Function
}

export function Root() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [snackbarOpen, setSnackbarOpen] = useState(searchParams.has("error"));
    const [snackbarSuccess, setSnackbarSuccess] = useState(! searchParams.has("error"));
    const [snackbarMessage, setSnackbarMessage] = useState(searchParams.get("error"));

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    }

    const outletContext: SnackbarContextType = {
        setSnackBarSuccess: (message: string) => {
            setSnackbarOpen(true);
            setSnackbarSuccess(true);
            setSnackbarMessage(message);
        },
        setSnackBarError: (message: string) => {
            setSnackbarOpen(true);
            setSnackbarSuccess(false);
            setSnackbarMessage(message);
        }
    };

    const auth = useAuth() as any;
    if ( ! auth.user ) {
        // user is not authenticated
        return <Navigate to="/login" />;
    }

    return (
        <Container maxWidth="md">
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSuccess ? "success" : "error"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
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
                        <Button color="inherit" onClick={() => auth.logout()}>Logout ({auth.user.username})</Button>
                    </Toolbar>
                </AppBar>
            </Box>
            <Outlet context={outletContext satisfies SnackbarContextType } />
        </Container>
    );
}