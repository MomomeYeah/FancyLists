import * as React from 'react';
import { Navigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAuth } from '../hooks/useAuth';


export function Login() {
    const auth = useAuth() as any;
    
    const [usernameError, setUsernameError] = React.useState(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [loginError, setLoginError] = React.useState(false);
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if ( usernameError || passwordError ) {
            return;
        }
        const data = new FormData(event.currentTarget);
        const username = data.get('username');
        const password = data.get('password');

        if ( username && password) {
            const error = await auth.login(username as string, password as string);
            setLoginError(error);
        }
    };
    
    const validateInputs = () => {
        const username = document.getElementById('username') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        
        let isValid = true;

        if ( ! username.value ) {
            setUsernameError(true);
            setUsernameErrorMessage('Username is required');
            isValid = false;
        } else {
            setUsernameError(false);
            setUsernameErrorMessage('');
        }
        
        if ( ! password.value ) {
            setPasswordError(true);
            setPasswordErrorMessage('Password is required');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }
        
        return isValid;
    };
    
    if ( auth.user ) {
        // user is already authenticated
        return <Navigate to="/" />;
    }
    return (
        <Container maxWidth="md">
            <Card variant="outlined" sx={{ padding: '2em' }}>
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                    Sign in
                </Typography>
                {loginError &&
                    <Alert variant="filled" severity="error" sx={{mt: '1em', mb: '2em'}}>
                        {loginError}
                    </Alert>
                }
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 2,
                    }}
                >
                    <FormControl>
                        <FormLabel htmlFor="username">Username</FormLabel>
                        <TextField
                            error={usernameError}
                            helperText={usernameErrorMessage}
                            id="username"
                            type="text"
                            name="username"
                            placeholder="username"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={usernameError ? 'error' : 'primary'}
                            sx={{ ariaLabel: 'username' }}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMessage}
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••"
                            autoComplete="current-password"
                            required
                            fullWidth
                            variant="outlined"
                            color={passwordError ? 'error' : 'primary'}
                            />
                    </FormControl>
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        onClick={validateInputs}
                    >
                        Sign in
                    </Button>
                    <Typography sx={{ textAlign: 'center' }}>
                        Don&apos;t have an account?{' '}
                        <span>
                            <Link
                                href="/material-ui/getting-started/templates/sign-in/"
                                variant="body2"
                                sx={{ alignSelf: 'center' }}
                            >
                                Sign up
                            </Link>
                        </span>
                    </Typography>
                </Box>
            </Card>
        </Container>
    );
}