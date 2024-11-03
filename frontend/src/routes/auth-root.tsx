import { Outlet } from 'react-router-dom';
import { AuthProvider } from "../hooks/useAuth";

export function AuthRoot() {
    /**
     * Top-level component to wrap AuthProvider around all other components. Doing this at 
     * the top level ensures that all other components are able to access useNavigator as
     * provided by React Router
     */

    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}