// copied shamelessly from https://blog.logrocket.com/authentication-react-router-v6/

import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import { APIResponse, login as doLogin, register as doRegister } from '../loaders';

const AuthContext = createContext({});

export const AuthProvider = ({children }: {children: React.ReactNode}) => {
    const [user, setUser] = useLocalStorage("user", null);
    const navigate = useNavigate();
    
    // call this function when you want to authenticate the user
    const login = async (username: string, password: string) => {
        const loginResponse = await doLogin(username, password) as APIResponse<any>;
        if ( loginResponse.success ) {
            setUser({
                username: username,
                key: loginResponse.data.key
            });
            navigate("/");
        } else {
            return loginResponse.error;
        }
    };
    
    // call this function to register a new user
    const register = async (username: string, password: string) => {
        const registerResponse = await doRegister(username, password) as APIResponse<any>;
        if ( registerResponse.success ) {
            return login(username, password);
        } else {
            return registerResponse.error;
        }
    };
    
    // call this function to sign out logged in user
    const logout = () => {
        setUser(null);
    };
    
    const value = useMemo(
        () => ({
            user,
            login,
            register,
            logout,
        }),
        [user]
    );
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};