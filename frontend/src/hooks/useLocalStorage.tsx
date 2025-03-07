// copied shamelessly from https://blog.logrocket.com/authentication-react-router-v6/

import { useState } from "react";

export const useLocalStorage = (keyName: string, defaultValue: string | null) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = window.localStorage.getItem(keyName);
            if (value) {
                return JSON.parse(value);
            } else if (defaultValue) {
                window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
                return defaultValue;
            } else {
                return defaultValue;
            }
        } catch (err) {
            return defaultValue;
        }
    });
    const setValue = (newValue: string | null) => {
        try {
            if ( ! newValue ) {
                window.localStorage.removeItem(keyName);
            } else {
                window.localStorage.setItem(keyName, JSON.stringify(newValue));
            }
        } catch (err) {
            console.log(err);
        }
        setStoredValue(newValue);
    };
    return [storedValue, setValue];
};