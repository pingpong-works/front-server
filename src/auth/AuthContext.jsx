import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const initialState = JSON.parse(sessionStorage.getItem('authState')) || {
        isAuthenticated: false,
        token: null,
    }
    const [state, setState] = useState(initialState);

    const login = (token) => {
        /* console.log('login 함수 호출') */
        const newState = {
            isAuthenticated: true,
            token,
        }
        setState(newState);
        sessionStorage.setItem('authState', JSON.stringify(newState));
    };

    const logout = () => {
        const newState = {
            isAuthenticated: false,
            token: null,
        }
        setState(newState);
        sessionStorage.removeItem('authState');
    };

    useEffect(() => {
        const savedState = JSON.parse(sessionStorage.getItem('authState'));
        if(savedState){
            setState(savedState);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

