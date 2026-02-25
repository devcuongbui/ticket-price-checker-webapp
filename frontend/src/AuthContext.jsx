import { createContext, useContext, useState, useEffect } from "react";
import { setTokens, clearTokens, getMe } from "./api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const initAuth = async () => {
        try {
            const data = await getMe();
            setUser(data);
        } catch (e) {
            setUser(null);
            clearTokens();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initAuth();

        const handleExpired = () => {
            setUser(null);
        };
        window.addEventListener("auth-expired", handleExpired);
        return () => window.removeEventListener("auth-expired", handleExpired);
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        clearTokens();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: initAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
