// copied shamelessly from https://blog.logrocket.com/authentication-react-router-v6/

import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";

const AuthContext = createContext({});

export const AuthProvider = ({children }: {children: React.ReactNode}) => {
    const [user, setUser] = useLocalStorage("user", null);
    const navigate = useNavigate();
    
    // call this function when you want to authenticate the user
    const login = async (username: string, password: string) => {
        const loginURL = "http://localhost:8000/auth/login/";
        const response = await fetch(loginURL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        const responseData = await response.json();
        const userData = {
            username: username,
            key: responseData.key
        }
        console.log(userData);
        setUser(userData);
        navigate("/");
    };
    
    // call this function to sign out logged in user
    const logout = () => {
        setUser(null);
    };
    
    const value = useMemo(
        () => ({
            user,
            login,
            logout,
        }),
        [user]
    );
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};