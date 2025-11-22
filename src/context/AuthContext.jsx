import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const me = async () => {
        try {
            const { data } = await api.get('/api/auth/me');
            setUser(data);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        const tk = localStorage.getItem('tp_token');
        if (tk) me();
    }, []);

    const login = async (payload) => {
        const { data } = await api.post('/api/auth/login', payload);
        localStorage.setItem('tp_token', data.token);
        await me();
    };

    const register = async (payload) => {
        const { data } = await api.post('/api/auth/register', payload);
        localStorage.setItem('tp_token', data.token);
        await me();
    };

    const logout = () => {
        localStorage.removeItem('tp_token');
        setUser(null);
    };

    const updateUser = (patch) => {
        setUser((prev) => (prev ? { ...prev, ...patch } : prev));
    };

    return (
        <AuthCtx.Provider value={{ user, login, register, logout, updateUser }}>
            {children}
        </AuthCtx.Provider>
    );
};

export const useAuth = () => useContext(AuthCtx);
