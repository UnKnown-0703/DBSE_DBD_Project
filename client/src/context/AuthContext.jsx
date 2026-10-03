import React, { createContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load session from localStorage on boot
    useEffect(() => {
        const storedToken = localStorage.getItem('erp_token');
        const storedUser = localStorage.getItem('erp_user');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed.');
            }

            // Save to localStorage
            localStorage.setItem('erp_token', data.token);
            localStorage.setItem('erp_user', JSON.stringify(data.user));

            // Set state
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (err) {
            console.error('Auth context login error:', err.message);
            return { success: false, error: err.message };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        setToken(null);
        setUser(null);
    };

    // Update user profile in localStorage and state
    const updateProfile = (updatedDetails) => {
        const currentUser = JSON.parse(localStorage.getItem('erp_user') || '{}');
        const newUser = { ...currentUser, ...updatedDetails };
        
        localStorage.setItem('erp_user', JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
